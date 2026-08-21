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

    if (conAccion) {
        accion.hidden = false;
        accion.href = ZIP_URL;
    }

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

document.addEventListener('DOMContentLoaded', async () => {

    // ── Enlaces de descarga ──────────────────────────────────────────────────
    document.querySelectorAll('[data-zip-link]').forEach(el => {
        el.href = ZIP_URL;
    });

    // ── Grilla de portales → detalle por medio ───────────────────────────────
    configurarEnlacesAMedios();

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
