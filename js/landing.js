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
 *
 * Nota de seguridad: el valor de ?version es entrada del usuario reflejada
 * en el DOM. Se valida con una expresión regular estricta y se inserta
 * siempre con textContent, nunca con innerHTML.
 */

const ZIP_URL = 'https://github.com/LucasPier/diarios-liberados/archive/refs/heads/main.zip';

/** Formato aceptado para una versión: entre 1 y 4 componentes numéricos */
const RE_VERSION = /^\d+(\.\d+){0,3}$/;

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
 * Pinta el bloque de estado de versión.
 *
 * @param {'ok'|'outdated'|'dev'} estado
 * @param {string} icono
 * @param {string} titulo
 * @param {string} texto
 * @param {boolean} conAccion — muestra el botón de descarga dentro del bloque
 */
function mostrarEstado(estado, icono, titulo, texto, conAccion) {
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

    // El botón de descarga solo tiene sentido cuando falta actualizar:
    // si el usuario ya está al día o va adelantado, no se ofrece.
    accion.hidden = !conAccion;
    if (conAccion) accion.href = ZIP_URL;

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

/**
 * Identifica el navegador Chromium desde el que se visita la página.
 *
 * Se consulta de más específico a más genérico, porque varios navegadores
 * declaran también las marcas de las que derivan (Edge y Opera incluyen
 * "Chromium", por ejemplo) y quedarse con la primera coincidencia genérica
 * daría un resultado equivocado.
 *
 * Limitación conocida: Vivaldi se presenta como Chrome salvo que el usuario
 * active el enmascarado de marca, así que se lo detecta como Chrome.
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

    if (incluye('brave'))         return 'brave';
    if (incluye('microsoft edge')) return 'edge';
    if (incluye('opera'))         return 'opera';
    if (incluye('vivaldi'))       return 'vivaldi';
    if (incluye('google chrome')) return 'chrome';
    if (incluye('chromium'))      return 'chromium';
    return null;
}

/**
 * Determina si el navegador es de la familia Chromium.
 * Se recurre al user agent como respaldo porque userAgentData no existe en
 * versiones de Chromium anteriores a 2021 ni fuera de un contexto seguro.
 */
function esChromium() {
    if (navigator.userAgentData) return true;
    return /\bChrom(e|ium)\//.test(navigator.userAgent);
}

/** Nombre del navegador no compatible, si se puede reconocer */
function nombrarNavegadorIncompatible() {
    const ua = navigator.userAgent;
    if (/Firefox\//.test(ua))  return 'Firefox';
    if (/FxiOS\//.test(ua))    return 'Firefox para iOS';
    if (/CriOS\//.test(ua))    return 'Chrome para iOS';
    if (/Safari\//.test(ua) && !/Chrom/.test(ua)) return 'Safari';
    return null;
}

/** Muestra el aviso de navegador no compatible */
function avisarNoCompatible() {
    const aviso  = document.getElementById('navegadores-aviso');
    const titulo = document.getElementById('navegadores-aviso-titulo');
    const texto  = document.getElementById('navegadores-aviso-texto');
    if (!aviso || !titulo || !texto) return;

    const nombre = nombrarNavegadorIncompatible();
    titulo.textContent = nombre
        ? `Estás navegando en ${nombre}`
        : 'Tu navegador no es compatible';
    texto.textContent = 'La extensión necesita un navegador basado en Chromium. '
        + 'Abrí esta página desde alguno de los que figuran abajo para poder instalarla.';

    aviso.hidden = false;
}

/**
 * Resalta el navegador en uso dentro de la franja y, si no es compatible,
 * lo advierte antes de que el usuario recorra toda la instalación.
 */
async function marcarNavegadorEnUso() {
    if (!document.querySelector('.navegadores-franja')) return;

    if (!esChromium()) {
        avisarNoCompatible();
        return;
    }

    const slug = await detectarNavegador();
    // Ante la duda no se marca nada: señalar el navegador equivocado sería
    // peor que no señalar ninguno.
    if (!slug) return;

    const tarjeta = document.querySelector(`.navegador[data-navegador="${slug}"]`);
    if (!tarjeta) return;

    tarjeta.classList.add('is-actual');
    tarjeta.setAttribute('aria-current', 'true');

    const chip = document.createElement('span');
    chip.className = 'navegador-chip';
    chip.textContent = 'El tuyo';
    tarjeta.appendChild(chip);
}

document.addEventListener('DOMContentLoaded', async () => {

    // ── Enlaces de descarga ──────────────────────────────────────────────────
    document.querySelectorAll('[data-zip-link]').forEach(el => {
        el.href = ZIP_URL;
    });

    // ── Grilla de portales → detalle por medio ───────────────────────────────
    configurarEnlacesAMedios();

    // ── Navegador en uso ─────────────────────────────────────────────────────
    marcarNavegadorEnUso();

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
            false
        );
    } else if (comparacion < 0) {
        mostrarEstado(
            'outdated',
            '!',
            'Hay una versión nueva',
            `Tenés la v${versionInstalada} y ya está disponible la v${versionPublicada}. Descargá el ZIP y volvé a cargar la carpeta en tu navegador.`,
            true
        );
    } else {
        mostrarEstado(
            'dev',
            'i',
            'Versión de desarrollo',
            `Tenés instalada la v${versionInstalada}, más nueva que la v${versionPublicada} publicada. No necesitás hacer nada.`,
            false
        );
    }

    destacarEstado();
});
