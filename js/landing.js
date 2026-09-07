/**
 * landing.js — Lógica de la página de presentación (GitHub Pages)
 *
 * Responsabilidades:
 *  1. Leer la versión publicada desde el propio manifest.json del repo,
 *     evitando duplicar el número de versión en el HTML.
 *  2. Interpretar el parámetro ?version=X.Y.Z que envía el popup de la
 *     extensión con la versión que el usuario tiene instalada.
 *  3. Comparar ambas versiones con criterio semver (numérico, no textual)
 *     e informar al usuario si está al día o si hay una versión nueva.
 *  4. Mostrar UN solo camino de instalación: el de la plataforma y el
 *     navegador desde los que se está visitando la página.
 *
 * Nota de seguridad: el valor de ?version es entrada del usuario reflejada
 * en el DOM. Se valida con una expresión regular estricta y se inserta
 * siempre con textContent, nunca con innerHTML.
 */

const ZIP_URL = 'https://github.com/LucasPier/diarios-liberados/archive/refs/heads/main.zip';

/** Página del último release: respaldo cuando no se puede leer updates.json */
const RELEASES_URL = 'https://github.com/LucasPier/diarios-liberados/releases/latest';

/** Identificador del add-on dentro de updates.json */
const ID_ADDON = 'diarios-liberados@lucaspier.github.io';

/** Formato aceptado para una versión: entre 1 y 4 componentes numéricos */
const RE_VERSION = /^\d+(\.\d+){0,3}$/;

/* Marca el documento como "con JS" apenas se parsea este archivo, antes del
   DOMContentLoaded: hay estilos que sólo valen cuando las pestañas funcionan
   y esperar al evento provocaría un parpadeo. */
document.documentElement.classList.add('js');

/**
 * Convierte una cadena de versión en un array de enteros.
 * @param {string} version — ej. "1.10.0"
 * @returns {number[]} ej. [1, 10, 0]
 */
function parsearVersion(version) {
    return version.split('.').map(Number);
}

/**
 * Compara dos versiones componente a componente de forma NUMÉRICA.
 * Comparar como texto sería incorrecto: "1.10.0" < "1.9.0" es true en
 * orden lexicográfico y falso en orden de versiones.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} -1 si a < b, 0 si son iguales, 1 si a > b
 */
function compararVersiones(a, b) {
    const va = parsearVersion(a);
    const vb = parsearVersion(b);
    const largo = Math.max(va.length, vb.length);

    for (let i = 0; i < largo; i++) {
        // Los componentes ausentes cuentan como 0: "1.2" equivale a "1.2.0"
        const na = va[i] || 0;
        const nb = vb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
    }
    return 0;
}

/**
 * Obtiene la versión instalada a partir del parámetro ?version de la URL.
 * @returns {string|null} la versión validada, o null si no vino o es inválida
 */
function obtenerVersionInstalada() {
    const valor = new URLSearchParams(window.location.search).get('version');
    if (!valor) return null;

    const limpio = valor.trim();
    return RE_VERSION.test(limpio) ? limpio : null;
}

/**
 * Lee la versión publicada desde el manifest.json servido junto a esta página.
 * Al estar ambos archivos en la raíz del repo, la ruta relativa siempre apunta
 * al manifest que va incluido en el ZIP de descarga.
 *
 * @returns {Promise<string|null>}
 */
async function obtenerVersionPublicada() {
    try {
        const respuesta = await fetch('manifest.json', { cache: 'no-cache' });
        if (!respuesta.ok) return null;

        const manifest = await respuesta.json();
        const version = typeof manifest.version === 'string' ? manifest.version.trim() : '';
        return RE_VERSION.test(version) ? version : null;
    } catch {
        return null;
    }
}

/**
 * Lee la URL del .xpi desde updates.json, el mismo archivo que consulta Firefox
 * para actualizarse.
 *
 * El nombre del asset lleva la versión adentro, así que un link escrito a mano
 * en el HTML quedaría viejo en cada release sin que nada falle de forma visible.
 * Leerlo de acá mantiene la regla del proyecto: la versión y su URL viven en un
 * solo lugar y nadie las duplica.
 *
 * @returns {Promise<string|null>} la URL, o null para caer al respaldo
 */
async function obtenerUrlXpi() {
    try {
        const respuesta = await fetch('updates.json', { cache: 'no-cache' });
        if (!respuesta.ok) return null;

        const datos = await respuesta.json();
        const addon = datos && datos.addons && datos.addons[ID_ADDON];
        const updates = addon && addon.updates;
        if (!Array.isArray(updates) || updates.length === 0) return null;

        // El archivo puede listar varias versiones y no necesariamente en orden:
        // se compara para quedarse con la más nueva.
        const ultima = updates.reduce((mayor, actual) => (
            compararVersiones(actual.version || '0', mayor.version || '0') > 0 ? actual : mayor
        ));

        const link = typeof ultima.update_link === 'string' ? ultima.update_link : '';
        // Sólo se acepta una URL del repo: si el JSON viniera alterado, el botón
        // cae al respaldo en lugar de mandar al usuario a descargar otra cosa.
        return link.startsWith('https://github.com/LucasPier/diarios-liberados/') ? link : null;
    } catch {
        return null;
    }
}

/**
 * Pinta el bloque de estado de versión.
 *
 * @param {'ok'|'outdated'|'dev'} estado
 * @param {string} icono
 * @param {string} titulo
 * @param {string} texto
 * @param {string|null} hrefAccion — URL del botón de descarga, o null para ocultarlo
 */
function mostrarEstado(estado, icono, titulo, texto, hrefAccion) {
    const bloque  = document.getElementById('version-status');
    const iconoEl = document.getElementById('version-status-icon');
    const tituloEl = document.getElementById('version-status-title');
    const textoEl = document.getElementById('version-status-text');
    const accion  = document.getElementById('version-status-action');
    if (!bloque) return;

    bloque.classList.add(`is-${estado}`);
    iconoEl.textContent  = icono;
    tituloEl.textContent = titulo;
    textoEl.textContent  = texto;

    // El botón de descarga solo tiene sentido cuando falta actualizar y la
    // actualización es manual: en Firefox de escritorio se hace sola.
    accion.hidden = !hrefAccion;
    if (hrefAccion) accion.href = hrefAccion;

    bloque.hidden = false;
}

/** Lleva la vista al bloque de estado y lo resalta brevemente */
function destacarEstado() {
    const bloque = document.getElementById('version-status');
    if (!bloque || bloque.hidden) return;

    bloque.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bloque.classList.add('is-highlight');
    bloque.addEventListener('animationend', () => {
        bloque.classList.remove('is-highlight');
    }, { once: true });
}

/**
 * Abre la ficha del detalle correspondiente a un medio, desplegando primero
 * el <details> que la contiene y resaltándola al llegar.
 *
 * @param {string} id — id de la ficha, ej. "medio-clarin"
 * @returns {boolean} true si la ficha existe y se pudo mostrar
 */
function abrirFichaMedio(id) {
    const ficha = document.getElementById(id);
    if (!ficha) return false;

    // El <details> viene plegado: hay que abrirlo antes de desplazarse,
    // porque mientras está cerrado la ficha no ocupa lugar en el layout.
    const contenedor = ficha.closest('details');
    if (contenedor) contenedor.open = true;

    ficha.scrollIntoView({ behavior: 'smooth', block: 'center' });

    ficha.classList.remove('is-highlight');
    // Forzar un reflow para poder reiniciar la animación en clics consecutivos
    void ficha.offsetWidth;
    ficha.classList.add('is-highlight');
    ficha.addEventListener('animationend', () => {
        ficha.classList.remove('is-highlight');
    }, { once: true });

    return true;
}

/** Conecta los logos de la grilla con su ficha del detalle */
function configurarEnlacesAMedios() {
    document.querySelectorAll('a[href^="#medio-"]').forEach(enlace => {
        enlace.addEventListener('click', evento => {
            const id = enlace.getAttribute('href').slice(1);
            // Si la ficha no existiera, se deja actuar al navegador
            if (!abrirFichaMedio(id)) return;

            evento.preventDefault();
            history.replaceState(null, '', `#${id}`);
        });
    });

    // Entrada directa con el hash puesto en la URL: el navegador intenta
    // desplazarse antes de que este script abra el <details>, así que se
    // rehace el salto una vez que el DOM ya está listo.
    const hashInicial = window.location.hash.slice(1);
    if (hashInicial.startsWith('medio-')) {
        requestAnimationFrame(() => abrirFichaMedio(hashInicial));
    }
}

/* ═══════════════════════════════════════════════════════════
   Detección del entorno
   ═══════════════════════════════════════════════════════════ */

/**
 * Plataforma desde la que se visita la página.
 * @returns {'escritorio'|'android'|'ios'}
 */
function detectarPlataforma() {
    const ua = navigator.userAgent;

    // iPadOS 13+ se presenta como Macintosh a propósito. La única pista que
    // queda es el táctil: una Mac de escritorio informa maxTouchPoints 0.
    const esIPad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/.test(ua) || esIPad) return 'ios';

    if (/Android/.test(ua)) return 'android';
    return 'escritorio';
}

/**
 * Familia del motor del navegador. Es lo que determina el camino de
 * instalación: dentro de una misma familia los pasos son los mismos.
 *
 * @returns {'chromium'|'gecko'|'otro'}
 */
function detectarFamilia() {
    // userAgentData es exclusiva de Chromium: si existe, no hay más que mirar.
    if (navigator.userAgentData) return 'chromium';

    const ua = navigator.userAgent;
    if (/\bChrom(e|ium)\//.test(ua) || /\bCriOS\//.test(ua)) return 'chromium';

    // Firefox para iOS (FxiOS) queda afuera a propósito: es un envoltorio
    // sobre WebKit, no Gecko, y no admite complementos.
    if (/\bFirefox\//.test(ua)) return 'gecko';

    return 'otro';
}

/**
 * Identifica el navegador Chromium desde el que se visita la página.
 *
 * Se consulta de más específico a más genérico, porque varios navegadores
 * declaran también las marcas de las que derivan (Edge y Opera incluyen
 * "Chromium", por ejemplo) y quedarse con la primera coincidencia genérica
 * daría un resultado equivocado.
 *
 * Limitación conocida: Vivaldi se presenta como Chrome salvo que el usuario
 * active el enmascarado de marca, así que se lo detecta como Chrome. Desde que
 * la franja es un selector eso dejó de ser un problema serio: el usuario puede
 * corregirlo con un clic.
 *
 * @returns {Promise<string|null>} slug del navegador, o null si no se pudo determinar
 */
async function detectarNavegador() {
    // Brave expone una API propia. Puede no estar disponible: el navegador la
    // deshabilita en sitios donde detecta bloqueos o fallos de compatibilidad.
    try {
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            if (await navigator.brave.isBrave()) return 'brave';
        }
    } catch {
        // Si la consulta falla se sigue con el resto de las comprobaciones
    }

    const marcas = navigator.userAgentData && navigator.userAgentData.brands;
    if (!Array.isArray(marcas)) return null;

    // La lista incluye una entrada señuelo ("Not;A=Brand") cuya grafía y
    // posición varían a propósito, así que se recorre buscando por nombre.
    const incluye = texto => marcas.some(
        m => typeof m.brand === 'string' && m.brand.toLowerCase().includes(texto)
    );

    if (incluye('brave'))          return 'brave';
    if (incluye('microsoft edge')) return 'edge';
    if (incluye('opera'))          return 'opera';
    if (incluye('vivaldi'))        return 'vivaldi';
    if (incluye('google chrome'))  return 'chrome';
    if (incluye('chromium'))       return 'chromium';
    return null;
}

/**
 * Nombre del navegador cuando no se lo puede identificar por marcas.
 *
 * Los derivados de Firefox (LibreWolf, Waterfox, Tor Browser) se presentan
 * como Firefox a secas de forma deliberada: es una función de privacidad, no
 * un descuido, y no hay que intentar distinguirlos.
 */
function nombrarNavegador() {
    const ua = navigator.userAgent;
    if (/\bFirefox\//.test(ua)) return 'Firefox';
    if (/\bFxiOS\//.test(ua))   return 'Firefox para iOS';
    if (/\bCriOS\//.test(ua))   return 'Chrome para iOS';
    if (/\bSafari\//.test(ua) && !/Chrom/.test(ua)) return 'Safari';
    return null;
}

/* ═══════════════════════════════════════════════════════════
   Sección de instalación: plataforma → navegador → pasos
   ═══════════════════════════════════════════════════════════ */

/** Muestra el aviso contextual arriba de la sección de instalación */
function mostrarAviso(titulo, texto) {
    const aviso     = document.getElementById('navegadores-aviso');
    const tituloEl  = document.getElementById('navegadores-aviso-titulo');
    const textoEl   = document.getElementById('navegadores-aviso-texto');
    if (!aviso || !tituloEl || !textoEl) return;

    tituloEl.textContent = titulo;
    textoEl.textContent  = texto;
    aviso.hidden = false;
}

/**
 * Rellena los huecos variables de un camino con los datos del navegador
 * elegido. Los pasos de Chromium son los mismos para los seis navegadores,
 * pero la pantalla de extensiones no: Edge cambia el esquema de la URL, el
 * nombre del interruptor ("Modo para desarrolladores"), dónde está (abajo a
 * la izquierda) y cómo llama al botón ("Cargar desempaquetado").
 *
 * Cada tarjeta declara lo suyo en `data-*` y acá se vuelca en los `data-token`
 * del paso. El dato vive en el HTML a propósito: sumar un navegador es sumar
 * una tarjeta, sin tocar este archivo.
 *
 * @param {HTMLElement} camino
 * @param {HTMLElement} boton — la tarjeta del navegador elegido
 */
function aplicarTokens(camino, boton) {
    const valores = {
        'nombre':            boton.dataset.nombre,
        // La tarjeta guarda el esquema pelado ("edge"); el paso muestra la URL.
        'esquema':           boton.dataset.esquema && `${boton.dataset.esquema}://extensions/`,
        'boton-cargar':      boton.dataset.botonCargar,
        'interruptor':       boton.dataset.interruptor,
        'interruptor-donde': boton.dataset.interruptorDonde,
    };

    Object.entries(valores).forEach(([token, valor]) => {
        if (!valor) return;
        camino.querySelectorAll(`[data-token="${token}"]`).forEach(el => {
            el.textContent = valor;
        });
    });

    // Capturas de pantalla: sólo Chrome y Edge tienen una propia, porque son
    // las dos pantallas que de verdad se ven distinto. Los otros cuatro miran
    // la de Chrome, y por eso se les aclara de quién es la que están viendo.
    const captura = boton.dataset.captura || 'chrome';

    camino.querySelectorAll('[data-captura]').forEach(el => {
        el.hidden = el.dataset.captura !== captura;
    });

    camino.querySelectorAll('[data-captura-ajena]').forEach(el => {
        el.hidden = captura === boton.dataset.navegador;
    });

    // Aclaraciones que sólo hacen falta mientras no se sabe qué navegador usa
    // el usuario. Con uno elegido, el paso ya dice la URL y la etiqueta exactas.
    camino.querySelectorAll('[data-generico]').forEach(el => {
        el.hidden = true;
    });
}

/**
 * Elige un navegador: lo marca en su franja y deja visible únicamente el
 * camino de instalación que le corresponde.
 *
 * @param {HTMLElement} boton
 */
function elegirNavegador(boton) {
    const panel = boton.closest('.plataforma-panel');
    if (!panel) return;

    panel.querySelectorAll('.navegador').forEach(otro => {
        const elegido = otro === boton;
        otro.classList.toggle('is-elegida', elegido);
        otro.setAttribute('aria-pressed', String(elegido));
    });

    panel.querySelectorAll('.camino').forEach(camino => {
        const visible = camino.id === `camino-${boton.dataset.camino}`;
        camino.hidden = !visible;
        if (visible) aplicarTokens(camino, boton);
    });
}

/**
 * Muestra la plataforma pedida y, si el panel no tenía ninguno elegido,
 * selecciona su primer navegador para que nunca se vea un panel sin pasos.
 *
 * @param {'escritorio'|'movil'} plataforma
 */
function elegirPlataforma(plataforma) {
    document.querySelectorAll('.plataforma-tab').forEach(tab => {
        const activa = tab.dataset.plataforma === plataforma;
        tab.setAttribute('aria-selected', String(activa));
        // Roving tabindex: dentro de un grupo de pestañas, el tabulador entra
        // una sola vez y el resto se recorre con las flechas.
        tab.tabIndex = activa ? 0 : -1;
    });

    document.querySelectorAll('.plataforma-panel').forEach(panel => {
        const activo = panel.id === `panel-${plataforma}`;
        panel.hidden = !activo;

        if (activo && !panel.querySelector('.navegador.is-elegida')) {
            const primero = panel.querySelector('.navegador');
            if (primero) elegirNavegador(primero);
        }
    });
}

/** Deja las pestañas operables con las flechas del teclado */
function configurarTecladoEnPestanas() {
    const tabs = Array.from(document.querySelectorAll('.plataforma-tab'));

    tabs.forEach((tab, indice) => {
        tab.addEventListener('keydown', evento => {
            let destino = null;
            if (evento.key === 'ArrowRight') destino = tabs[(indice + 1) % tabs.length];
            if (evento.key === 'ArrowLeft')  destino = tabs[(indice - 1 + tabs.length) % tabs.length];
            if (!destino) return;

            evento.preventDefault();
            elegirPlataforma(destino.dataset.plataforma);
            destino.focus();
        });
    });
}

/**
 * Marca con un distintivo la tarjeta del navegador desde el que se visita la
 * página. Es informativo y va aparte de la elección: el usuario puede estar
 * mirando desde una máquina y querer instalarla en otra.
 *
 * @param {string} slug
 */
function marcarNavegadorEnUso(slug) {
    const tarjeta = document.querySelector(`.navegador[data-navegador="${slug}"]`);
    if (!tarjeta) return;

    tarjeta.classList.add('is-actual');
    tarjeta.setAttribute('aria-current', 'true');

    const chip = document.createElement('span');
    chip.className = 'navegador-chip';
    chip.textContent = 'El tuyo';
    tarjeta.appendChild(chip);
}

/**
 * Arma la sección de instalación completa: activa las pestañas, elige el
 * camino que le toca al visitante y avisa cuando su combinación de plataforma
 * y navegador no tiene ninguno.
 */
async function configurarInstalacion() {
    const tabs = document.getElementById('plataforma-tabs');
    if (!tabs) return;

    // Con JS disponible los paneles se controlan por pestañas. Hasta acá los
    // dos venían visibles y apilados, que es como se ve la página sin JS.
    tabs.hidden = false;
    configurarTecladoEnPestanas();

    tabs.querySelectorAll('.plataforma-tab').forEach(tab => {
        tab.addEventListener('click', () => elegirPlataforma(tab.dataset.plataforma));
    });

    document.querySelectorAll('.navegador').forEach(boton => {
        boton.addEventListener('click', () => elegirNavegador(boton));
    });

    const plataforma = detectarPlataforma();
    const familia    = detectarFamilia();

    // ── iOS: no hay ningún camino posible, y hay que decirlo sin rodeos ──────
    if (plataforma === 'ios') {
        elegirPlataforma('escritorio');
        mostrarAviso(
            'En iPhone y iPad no se puede instalar.',
            'Apple obliga a que todos los navegadores usen el motor de Safari y a que las '
            + 'extensiones se distribuyan dentro de una app aprobada por la App Store. '
            + 'Podés instalarla en una computadora o en un teléfono Android.'
        );
        return;
    }

    // ── Android: la única puerta es Firefox ─────────────────────────────────
    if (plataforma === 'android') {
        elegirPlataforma('movil');

        if (familia === 'gecko') {
            marcarNavegadorEnUso('firefox-android');
        } else {
            // La tarjeta vive en el panel de escritorio, pero su nombre sirve
            // igual para decirle al usuario desde dónde está entrando.
            const slug    = await detectarNavegador();
            const tarjeta = slug && document.querySelector(`.navegador[data-navegador="${slug}"]`);
            const nombre  = (tarjeta && tarjeta.dataset.nombre) || nombrarNavegador();

            mostrarAviso(
                nombre ? `Estás navegando en ${nombre}.` : 'Tu navegador no permite instalar extensiones.',
                'En Android las extensiones sólo se pueden instalar en Firefox. Instalá Firefox '
                + 'para Android y volvé a abrir esta página desde ahí para seguir los pasos.'
            );
        }
        return;
    }

    // ── Escritorio ──────────────────────────────────────────────────────────
    elegirPlataforma('escritorio');

    if (familia === 'gecko') {
        // Los derivados de Firefox no se pueden distinguir: todos caen acá y
        // todos comparten exactamente los mismos pasos.
        const tarjeta = document.querySelector('.navegador[data-navegador="firefox"]');
        if (tarjeta) {
            marcarNavegadorEnUso('firefox');
            elegirNavegador(tarjeta);
        }
        return;
    }

    if (familia === 'chromium') {
        const slug = await detectarNavegador();
        // Ante la duda no se marca nada: señalar el navegador equivocado sería
        // peor que no señalar ninguno. El camino de Chromium ya viene elegido.
        if (!slug) return;

        const tarjeta = document.querySelector(`.navegador[data-navegador="${slug}"]`);
        if (!tarjeta) return;

        marcarNavegadorEnUso(slug);
        elegirNavegador(tarjeta);
        return;
    }

    // ── Navegador de otra familia (Safari y compañía) ───────────────────────
    const nombre = nombrarNavegador();
    mostrarAviso(
        nombre ? `Estás navegando en ${nombre}.` : 'Tu navegador no es compatible.',
        'La extensión necesita un navegador basado en Chromium o en Firefox. Elegí abajo el '
        + 'que uses para ver sus pasos, o abrí esta página desde él.'
    );
}

/**
 * Camino de instalación que está visible en este momento. Lo usa el bloque de
 * estado de versión, porque cómo se actualiza la extensión depende de eso.
 *
 * @returns {'chromium'|'firefox'|'android'}
 */
function caminoVisible() {
    const elegido = document.querySelector('.plataforma-panel:not([hidden]) .navegador.is-elegida');
    return (elegido && elegido.dataset.camino) || 'chromium';
}

document.addEventListener('DOMContentLoaded', async () => {

    // ── Enlaces de descarga ──────────────────────────────────────────────────
    document.querySelectorAll('[data-zip-link]').forEach(el => {
        el.href = ZIP_URL;
    });

    // ── Grilla de portales → detalle por medio ───────────────────────────────
    configurarEnlacesAMedios();

    // ── Instalación: plataforma, navegador y pasos ───────────────────────────
    await configurarInstalacion();

    // ── Link al .xpi ─────────────────────────────────────────────────────────
    // El marcado ya trae la página de releases como href: sólo se pisa cuando
    // updates.json responde, así que un fallo acá nunca deja un botón muerto.
    const urlXpi = await obtenerUrlXpi();
    if (urlXpi) {
        document.querySelectorAll('[data-xpi-link]').forEach(el => {
            el.href = urlXpi;
        });
    }

    // ── Versión publicada ────────────────────────────────────────────────────
    const versionPublicada = await obtenerVersionPublicada();

    // Si el manifest no se pudo leer, la página sigue siendo usable:
    // el badge queda oculto y los botones de descarga funcionan igual.
    if (!versionPublicada) return;

    // ── Comparación con la versión instalada ─────────────────────────────────
    const versionInstalada = obtenerVersionInstalada();
    const badge = document.getElementById('version-badge');

    // Sin comparación el número de versión es un dato secundario: se muestra
    // como nota discreta. Cuando sí hay comparación, el bloque de estado ya
    // informa ambas versiones y la nota sobraría.
    if (!versionInstalada) {
        if (badge) {
            badge.textContent = `Última versión disponible: v${versionPublicada}`;
            badge.hidden = false;
        }
        return;
    }

    const comparacion = compararVersiones(versionInstalada, versionPublicada);

    if (comparacion === 0) {
        mostrarEstado(
            'ok',
            '✓',
            'Estás al día',
            `Tenés instalada la versión v${versionInstalada}, que es la última disponible.`,
            null
        );
    } else if (comparacion < 0) {
        // Cómo se actualiza cambia por completo según el navegador: en Firefox
        // de escritorio no hay nada que hacer, y ofrecerle una descarga sería
        // mandarlo a repetir a mano algo que ya está pasando solo.
        const camino = caminoVisible();

        if (camino === 'firefox') {
            mostrarEstado(
                'outdated',
                '!',
                'Hay una versión nueva',
                `Tenés la v${versionInstalada} y ya está disponible la v${versionPublicada}. `
                + 'No tenés que hacer nada: Firefox la actualiza sola. Si querés apurarla, entrá '
                + 'en about:addons, tocá el engranaje y elegí «Buscar actualizaciones».',
                null
            );
        } else if (camino === 'android') {
            mostrarEstado(
                'outdated',
                '!',
                'Hay una versión nueva',
                `Tenés la v${versionInstalada} y ya está disponible la v${versionPublicada}. `
                + 'Descargá el archivo y volvé a instalarlo desde los ajustes de Firefox.',
                urlXpi || RELEASES_URL
            );
        } else {
            mostrarEstado(
                'outdated',
                '!',
                'Hay una versión nueva',
                `Tenés la v${versionInstalada} y ya está disponible la v${versionPublicada}. `
                + 'Descargá el ZIP y volvé a cargar la carpeta en tu navegador.',
                ZIP_URL
            );
        }
    } else {
        mostrarEstado(
            'dev',
            'i',
            'Versión de desarrollo',
            `Tenés instalada la v${versionInstalada}, más nueva que la v${versionPublicada} publicada. No necesitás hacer nada.`,
            null
        );
    }

    destacarEstado();
});
