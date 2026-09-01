/**
 * build-firefox.js — Genera el paquete de la extensión para Firefox en `firefox/`.
 *
 * POR QUÉ EXISTE ESTE SCRIPT
 * Chrome y Firefox no se ponen de acuerdo en cómo declarar el background de MV3. Firefox no
 * soporta `background.service_worker` (bug 1573659, abierto desde 2019) y usa event pages con
 * `background.scripts`; Chrome soporta `service_worker` y, aunque desde la 121 ignora la clave
 * `scripts`, igual muestra en chrome://extensions la advertencia:
 *
 *     'background.scripts' requires manifest version of 2 or lower.
 *
 * Un manifest con las dos claves funciona en ambos motores, pero como la extensión se instala
 * descomprimida, esa advertencia la vería todo usuario de Chrome, para siempre. Por eso
 * `manifest.json` se mantiene 100% Chrome y las diferencias de Firefox se inyectan acá.
 *
 * Además, en Firefox la carpeta descomprimida no es un formato de distribución: hay que producir
 * un .xpi firmado por Mozilla. O sea que un artefacto aparte era inevitable de todos modos.
 *
 * USO
 *     node scripts/build-firefox.js                    genera firefox/
 *     node scripts/build-firefox.js --xpi              además empaqueta el .xpi
 *     node scripts/build-firefox.js --updates <xpi>    escribe updates.json desde el .xpi FIRMADO
 *
 * El resultado se carga en about:debugging#/runtime/this-firefox → "Cargar complemento temporal",
 * eligiendo `firefox/manifest.json`. Esa instalación **se pierde al cerrar Firefox**: es sólo para
 * desarrollo. Para tener la extensión instalada de verdad hay dos caminos, y los dos parten del
 * .xpi que genera `--xpi`:
 *
 *   · Desarrollo/verificación → Firefox Developer Edition o Nightly, con
 *     `xpinstall.signatures.required = false` en about:config. Instala el .xpi sin firmar y
 *     sobrevive a los reinicios.
 *   · Distribución real → firmar el .xpi en AMO como unlisted. En Release y Beta no hay override
 *     de la firma desde Firefox 48.
 *
 * Para firmar conviene `web-ext sign`, que arma el paquete por su cuenta; el .xpi de acá es
 * suficiente para instalar en Developer Edition y para probar.
 *
 * La carpeta `firefox/` y el .xpi son generados y están en .gitignore: no los edites a mano, se
 * pisan enteros en cada corrida.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const RAIZ = path.resolve(__dirname, "..");
const DESTINO = path.join(RAIZ, "firefox");

// Piso de versión de Firefox. Lo fija `world: "MAIN"` en content_scripts, que no existe antes de
// la 128 y que necesitan lanaciondom-, lagacetadom-, pagina12dom- y airedesantafe-spa.
const VERSION_MINIMA = "128.0";

// El ID es obligatorio en MV3: sin él Firefox no habilita storage.sync (su implementación se
// apoya en el Add-on ID) y AMO no puede firmar el paquete.
const GECKO_ID = "diarios-liberados@lucaspier.github.io";

// Dónde vive el manifest de actualización. Firefox sigue usando el update_url de la versión YA
// INSTALADA, así que esta URL es para siempre: si algún día deja de responder, las instalaciones
// existentes no se enteran de ninguna URL nueva y quedan congeladas. No la muevas.
const URL_UPDATES = "https://lucaspier.github.io/diarios-liberados/updates.json";

// El .xpi firmado se publica como asset del release, no en GitHub Pages: es un binario de ~300 KB
// por versión y no tiene por qué vivir en el repo. Los dos hosts sirven el Content-Type correcto
// (application/x-xpinstall), que es lo que hace que Firefox ofrezca instalar en vez de descargar.
const urlXpi = (version) =>
    `https://github.com/LucasPier/diarios-liberados/releases/download/v${version}/diarios-liberados-firefox-${version}.xpi`;

// Archivo de actualización que consume Firefox, servido por GitHub Pages desde la raíz del repo.
const ARCHIVO_UPDATES = "updates.json";

/**
 * Qué entra al paquete.
 *
 * Es lista blanca y no lista negra a propósito: el repo mezcla la extensión con la landing de
 * GitHub Pages (index.html, landing.js, landing.css, imagenes/navegadores/). Con lista negra,
 * cualquier archivo nuevo de la landing se colaría en el .xpi sin que nadie lo note.
 */
const ARCHIVOS = ["sw.js", "rules.json", "popup.html"];
const DIRECTORIOS = ["js", "css", "imagenes"];

// Rutas relativas al repo que NO van al paquete aunque vivan dentro de un directorio incluido.
const EXCLUIDOS = new Set([
    path.join("js", "landing.js"),
    path.join("css", "landing.css"),
    path.join("imagenes", "navegadores"),
    path.join("imagenes", "lucas.webp"),
]);

/**
 * Arma el manifest de Firefox a partir del de Chrome.
 *
 * Reconstruye el objeto clave por clave en vez de mutarlo para que `browser_specific_settings`
 * quede junto a `manifest_version` y el diff entre los dos manifests siga siendo legible.
 */
function manifestFirefox(original) {
    const salida = {};

    for (const [clave, valor] of Object.entries(original)) {
        if (clave === "background") {
            // Firefox: event page. El catálogo de cookies entra por el array `scripts` porque
            // importScripts() no existe fuera de un service worker (sw.js lo guarda con typeof).
            salida.background = {
                scripts: ["js/cookies-suscriptores.js", "sw.js"],
            };
            continue;
        }

        salida[clave] = valor;

        if (clave === "manifest_version") {
            salida.browser_specific_settings = {
                gecko: {
                    id: GECKO_ID,
                    strict_min_version: VERSION_MINIMA,

                    // AMO exige declarar qué datos recolecta la extensión. No recolecta ninguno, y
                    // "none" es excluyente: no puede convivir con otros valores en el array.
                    // Firefox 128 todavía no conoce la clave y la ignora con un warning de
                    // manifest; recién desde la 140 se usa para el consentimiento del usuario.
                    data_collection_permissions: { required: ["none"] },

                    // Sin update_url un add-on unlisted NO SE ACTUALIZA NUNCA: AMO sólo distribuye
                    // versiones listed. Por el mismo motivo esta clave es incompatible con una
                    // publicación listed, donde el linter la rechaza con MANIFEST_UPDATE_URL.
                    update_url: URL_UPDATES,
                },

                // Objeto vacío = compatible con Firefox para Android heredando el
                // strict_min_version de `gecko`. Sin esta clave, AMO da por sentado que la
                // extensión NO es compatible con Android. Sólo acepta strict_min_version y
                // strict_max_version: el id y el update_url van únicamente en `gecko`.
                gecko_android: {},
            };
        }
    }

    return salida;
}

/** Borra el destino de la corrida anterior, con guarda para no barrer otra cosa por un path mal armado. */
function limpiarDestino() {
    if (!fs.existsSync(DESTINO)) return;

    const esperado = path.join(RAIZ, "firefox");
    if (path.resolve(DESTINO) !== path.resolve(esperado) || path.basename(DESTINO) !== "firefox") {
        throw new Error(`Me niego a borrar "${DESTINO}": no es la carpeta generada.`);
    }
    fs.rmSync(DESTINO, { recursive: true, force: true });
}

function copiar(relativo) {
    const origen = path.join(RAIZ, relativo);
    const destino = path.join(DESTINO, relativo);

    if (!fs.existsSync(origen)) {
        throw new Error(`Falta "${relativo}" en el repo.`);
    }

    fs.cpSync(origen, destino, {
        recursive: true,
        filter: (src) => !EXCLUIDOS.has(path.relative(RAIZ, src)),
    });
}

// ── Empaquetado .xpi ────────────────────────────────────────────────────────
//
// El .xpi no es más que un zip con el manifest en la raíz. Se escribe a mano y no con una
// herramienta del sistema por dos motivos:
//
//   1. `Compress-Archive` de PowerShell 5.1 —lo único disponible por defecto en Windows— escribe
//      los nombres de entrada con backslash (`css\popup.css`). La especificación ZIP exige
//      forward slash (APPNOTE 4.4.17.1), así que Firefox no encuentra nada dentro de las
//      subcarpetas. Falla en silencio: el .xpi se instala y la extensión no hace nada.
//   2. Depender de que la máquina tenga `zip` o `7z` instalados contradice el "cero dependencias"
//      del proyecto y rompe el build en cualquier máquina nueva.
//
// Node trae `zlib`, que es todo lo que hace falta. Con fecha fija, además, dos builds del mismo
// código dan un .xpi byte por byte idéntico.

/** CRC-32, el checksum que exige el formato ZIP. Node lo trae desde la 20.15; el resto es fallback. */
const crc32 = zlib.crc32 || (() => {
    const tabla = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        tabla[i] = c;
    }
    return (buf) => {
        let c = -1;
        for (let i = 0; i < buf.length; i++) c = tabla[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
        return (c ^ -1) >>> 0;
    };
})();

/** Lista los archivos de `dir` como rutas relativas con separador POSIX, ordenadas. */
function listarRelativos(dir, base = dir) {
    const salida = [];
    const entradas = fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => (a.name < b.name ? -1 : 1));

    for (const entrada of entradas) {
        const completo = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            salida.push(...listarRelativos(completo, base));
        } else {
            salida.push(path.relative(base, completo).split(path.sep).join("/"));
        }
    }
    return salida;
}

/**
 * Escribe `origen` como un zip en `destino`.
 *
 * Sin entradas de directorio (el formato no las exige y Firefox no las necesita) y con fecha
 * fija 2020-01-01, para que el empaquetado sea reproducible.
 */
function escribirZip(origen, destino) {
    const HORA_DOS = 0;
    const FECHA_DOS = ((2020 - 1980) << 9) | (1 << 5) | 1;

    const locales = [];
    const central = [];
    let offset = 0;
    let cantidad = 0;

    for (const relativo of listarRelativos(origen)) {
        const contenido = fs.readFileSync(path.join(origen, relativo));
        const comprimido = zlib.deflateRawSync(contenido, { level: 9 });
        const nombre = Buffer.from(relativo, "utf8");
        const crc = crc32(contenido);

        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);   // firma de local file header
        local.writeUInt16LE(20, 4);           // versión necesaria para extraer
        local.writeUInt16LE(0x800, 6);        // flags: nombres en UTF-8
        local.writeUInt16LE(8, 8);            // método: deflate
        local.writeUInt16LE(HORA_DOS, 10);
        local.writeUInt16LE(FECHA_DOS, 12);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(comprimido.length, 18);
        local.writeUInt32LE(contenido.length, 22);
        local.writeUInt16LE(nombre.length, 26);
        locales.push(local, nombre, comprimido);

        const entrada = Buffer.alloc(46);
        entrada.writeUInt32LE(0x02014b50, 0); // firma de central directory
        entrada.writeUInt16LE(20, 4);         // versión que lo creó
        entrada.writeUInt16LE(20, 6);
        entrada.writeUInt16LE(0x800, 8);
        entrada.writeUInt16LE(8, 10);
        entrada.writeUInt16LE(HORA_DOS, 12);
        entrada.writeUInt16LE(FECHA_DOS, 14);
        entrada.writeUInt32LE(crc, 16);
        entrada.writeUInt32LE(comprimido.length, 20);
        entrada.writeUInt32LE(contenido.length, 24);
        entrada.writeUInt16LE(nombre.length, 28);
        entrada.writeUInt32LE(offset, 42);    // dónde arranca su local header
        central.push(entrada, nombre);

        offset += local.length + nombre.length + comprimido.length;
        cantidad++;
    }

    const directorio = Buffer.concat(central);
    const fin = Buffer.alloc(22);
    fin.writeUInt32LE(0x06054b50, 0);         // firma de end of central directory
    fin.writeUInt16LE(cantidad, 8);
    fin.writeUInt16LE(cantidad, 10);
    fin.writeUInt32LE(directorio.length, 12);
    fin.writeUInt32LE(offset, 16);

    fs.writeFileSync(destino, Buffer.concat([...locales, directorio, fin]));
    return cantidad;
}

/**
 * ¿El .xpi que hay en esa ruta ya está firmado por Mozilla?
 *
 * Los nombres de entrada de un zip van en texto plano, así que alcanza con buscar el bloque de
 * firma. No hace falta parsear el archivo entero para esta pregunta.
 */
function estaFirmado(ruta) {
    try {
        return fs.readFileSync(ruta).includes("META-INF/mozilla.rsa");
    } catch {
        return false;
    }
}

function empaquetarXpi(version) {
    const destino = path.join(RAIZ, `diarios-liberados-firefox-${version}.xpi`);

    // Después de firmar, el .xpi de AMO se guarda con este mismo nombre para subirlo al release.
    // Regenerar el paquete lo pisaría con una copia sin firmar, y el error no se ve por ningún
    // lado: el archivo pesa parecido, se llama igual, y recién falla en los usuarios, cuando el
    // hash de updates.json no le cuadra a Firefox y las actualizaciones se descartan en silencio.
    if (estaFirmado(destino)) {
        throw new Error(
            `"${path.basename(destino)}" ya está firmado por Mozilla; regenerarlo lo reemplazaría ` +
            `por una copia sin firmar.\n  Si de verdad querés rehacer el paquete, movelo o ` +
            `borralo a mano primero (el firmado también está en web-ext-artifacts/ y en AMO).`
        );
    }

    if (fs.existsSync(destino)) fs.rmSync(destino);

    const cantidad = escribirZip(DESTINO, destino);

    // Si el manifest no quedó en la raíz del zip, Firefox lo rechaza como paquete inválido.
    if (!fs.existsSync(path.join(DESTINO, "manifest.json"))) {
        throw new Error("El paquete no tiene manifest.json en la raíz.");
    }

    return { destino, cantidad };
}

/**
 * Escribe updates.json, el manifest de actualización que Firefox consulta cada 24 horas.
 *
 * Recibe el .xpi **FIRMADO**, no el que genera este script: AMO reempaqueta al firmar, así que son
 * archivos distintos y el hash del nuestro no sirve. Pasar el equivocado no da error visible —
 * Firefox descarga la actualización, el hash no cuadra y la descarta en silencio.
 */
function generarUpdates(rutaXpi) {
    if (!fs.existsSync(rutaXpi)) {
        throw new Error(`No existe "${rutaXpi}".`);
    }

    const version = JSON.parse(fs.readFileSync(path.join(RAIZ, "manifest.json"), "utf8")).version;
    const hash = crypto.createHash("sha256").update(fs.readFileSync(rutaXpi)).digest("hex");

    const updates = {
        addons: {
            [GECKO_ID]: {
                updates: [{
                    version,
                    update_link: urlXpi(version),
                    update_hash: `sha256:${hash}`,

                    // OJO: acá la clave es `applications`, al revés que en el manifest de la
                    // extensión, donde la deprecada es justamente esa. AddonUpdateChecker sólo
                    // mira `applications`; si se escribe `browser_specific_settings` no falla
                    // nada, simplemente se ignora el límite de versión y la actualización se le
                    // ofrece a Firefox que no la soporta.
                    applications: {
                        gecko: { strict_min_version: VERSION_MINIMA },
                    },
                }],
            },
        },
    };

    const destino = path.join(RAIZ, ARCHIVO_UPDATES);
    fs.writeFileSync(destino, JSON.stringify(updates, null, 4) + "\n", "utf8");
    return { destino, version, hash };
}

function contarArchivos(dir) {
    let total = 0;
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
        total += entrada.isDirectory() ? contarArchivos(path.join(dir, entrada.name)) : 1;
    }
    return total;
}

function main() {
    // `--updates` no genera el paquete: actualiza el manifest de actualización a partir de un .xpi
    // ya firmado. Es el paso siguiente a `web-ext sign`, no parte del build.
    const indiceUpdates = process.argv.indexOf("--updates");
    if (indiceUpdates !== -1) {
        const argumento = process.argv[indiceUpdates + 1];
        if (!argumento || argumento.startsWith("--")) {
            throw new Error("Falta el .xpi firmado: node scripts/build-firefox.js --updates <archivo.xpi>");
        }
        const { destino, version, hash } = generarUpdates(path.resolve(argumento));
        console.log(`${path.basename(destino)} actualizado.`);
        console.log(`  versión     : ${version}`);
        console.log(`  update_link : ${urlXpi(version)}`);
        console.log(`  update_hash : sha256:${hash.slice(0, 24)}…`);
        console.log("\nSubí el .xpi firmado como asset del release y commiteá updates.json.");
        return;
    }

    const original = JSON.parse(fs.readFileSync(path.join(RAIZ, "manifest.json"), "utf8"));

    if (original.manifest_version !== 3) {
        throw new Error(`Se esperaba manifest_version 3, hay ${original.manifest_version}.`);
    }

    limpiarDestino();
    fs.mkdirSync(DESTINO, { recursive: true });

    for (const archivo of ARCHIVOS) copiar(archivo);
    for (const dir of DIRECTORIOS) copiar(dir);

    const manifest = manifestFirefox(original);
    fs.writeFileSync(
        path.join(DESTINO, "manifest.json"),
        JSON.stringify(manifest, null, 4) + "\n",
        "utf8"
    );

    // Verificación cruzada: todo CSS de web_accessible_resources tiene que haber llegado al
    // paquete. Es el error más silencioso del repo — el <link> se inyecta igual y no falla nada
    // visible, sólo no aplica estilos.
    const declarados = (manifest.web_accessible_resources || []).flatMap(r => r.resources || []);
    const faltantes = declarados.filter(r => !fs.existsSync(path.join(DESTINO, r)));

    // Ídem para los content scripts y el background: si el manifest referencia un JS que la
    // lista blanca no copió, Firefox no carga la entrada.
    const scripts = [
        ...(manifest.background.scripts || []),
        ...(manifest.content_scripts || []).flatMap(c => c.js || []),
    ];
    const scriptsFaltantes = [...new Set(scripts)].filter(s => !fs.existsSync(path.join(DESTINO, s)));

    console.log(`Paquete de Firefox generado en firefox/ (${contarArchivos(DESTINO)} archivos).`);
    console.log(`  background          : ${JSON.stringify(manifest.background)}`);
    console.log(`  gecko               : ${JSON.stringify(manifest.browser_specific_settings.gecko)}`);
    console.log(`  versión             : ${manifest.version}`);
    console.log(`  recursos declarados : ${declarados.length}`);

    if (faltantes.length || scriptsFaltantes.length) {
        console.error("\nFALTAN archivos que el manifest referencia:");
        for (const f of [...scriptsFaltantes, ...faltantes]) console.error(`  - ${f}`);
        process.exit(1);
    }

    console.log("\nOK: todos los scripts y recursos declarados están en el paquete.");

    if (process.argv.includes("--xpi")) {
        const { destino, cantidad } = empaquetarXpi(manifest.version);
        const kb = Math.round(fs.statSync(destino).size / 1024);
        console.log(`\n${path.basename(destino)} — ${cantidad} entradas, ${kb} KB`);
        console.log("Instalable en Developer Edition/Nightly con xpinstall.signatures.required=false,");
        console.log("o para firmar en AMO como unlisted.");
    } else {
        console.log("Cargalo en about:debugging#/runtime/this-firefox eligiendo firefox/manifest.json");
        console.log("(esa instalación se pierde al cerrar Firefox; usá --xpi para una permanente)");
    }
}

try {
    main();
} catch (e) {
    // Sin stack trace: los errores de este script son avisos para leer, no bugs para depurar.
    console.error(`\nError: ${e.message}\n`);
    process.exit(1);
}
