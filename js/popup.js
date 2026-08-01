/**
 * popup.js — Lógica del popup de configuración de Diarios Liberados
 *
 * Responsabilidades:
 *  1. Leer el estado actual de las features desde chrome.storage.sync
 *     y reflejar ese estado en los toggles al abrir el popup.
 *  2. Guardar cambios en chrome.storage.sync cuando el usuario mueve un toggle.
 *  3. Detectar si hay tabs abiertas en dominios cubiertos por la extensión
 *     y mostrar el banner de recarga si es necesario.
 *  4. Disparar la recarga de esas tabs al presionar "Recargar ahora".
 */

// Dominios cubiertos por la extensión (subset de host_permissions del manifest)
const DOMINIOS_CUBIERTOS = [
    "lacapital.com.ar", "lavoz.com.ar", "lagaceta.com.ar", "clarin.com",
    "lanacion.com.ar", "infobae.com", "ellitoral.com", "puertonegocios.com",
    "rosario3.com", "lapoliticaonline.com", "pagina12.com.ar", "cronista.com",
    "ambito.com", "eldestapeweb.com", "perfil.com", "canalnet.tv", "batimes.com.ar",
    "ole.com.ar", "elciudadanoweb.com", "viapais.com.ar", "diariopopular.com.ar",
    "eltrecetv.com.ar", "radiomitre.com.ar", "tycsports.com", "ciudad.com.ar",
    "tn.com.ar", "cienradios.com", "minutouno.com", "letrap.com.ar", "mdzol.com",
    "losandes.com.ar", "eldia.com", "rionegro.com.ar", "diariouno.com.ar",
    "unosantafe.com.ar", "unoentrerios.com.ar"
];

/** Verifica si una URL pertenece a alguno de los dominios cubiertos */
function esDominioCubierto(url) {
    try {
        const hostname = new URL(url).hostname;
        return DOMINIOS_CUBIERTOS.some(d => hostname === d || hostname.endsWith('.' + d));
    } catch {
        return false;
    }
}

/**
 * Consulta las tabs activas en dominios cubiertos.
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
async function obtenerTabsCubiertas() {
    const tabs = await chrome.tabs.query({});
    return tabs.filter(tab => tab.url && esDominioCubierto(tab.url));
}

/**
 * Muestra u oculta el banner de recarga según si hay tabs cubiertas abiertas,
 * adaptando el texto del mensaje según la cantidad de pestañas abiertas detectadas.
 */
async function actualizarBannerRecarga() {
    const wrapper = document.getElementById('reload-banner-wrapper');
    const textSpan = document.getElementById('reload-banner-text');
    if (!wrapper || !textSpan) return;

    const tabsCubiertas = await obtenerTabsCubiertas();
    const totalTabs = tabsCubiertas.length;

    if (totalTabs === 0) {
        wrapper.classList.remove('visible');
    } else {
        if (totalTabs === 1) {
            textSpan.textContent = 'Recargá la página para aplicar los cambios';
        } else {
            textSpan.textContent = 'Recargá las páginas para aplicar los cambios';
        }
        wrapper.classList.add('visible');
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // ── Versión ──────────────────────────────────────────────────────────────
    const versionElement = document.getElementById('extension-version');
    if (versionElement) {
        try {
            const manifest = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest
                ? chrome.runtime.getManifest()
                : null;
            const version = manifest ? manifest.version : '1.2.0';
            versionElement.textContent = `v${version}`;
        } catch (e) {
            versionElement.textContent = 'v1.2.0';
        }
    }

    // ── Leer config actual y reflejar en toggles ──────────────────────────────
    const cfg = await chrome.storage.sync.get({
        feature_publicidad:     true,
        feature_notificaciones: true,
        feature_suscriptores:   true
    });

    document.getElementById('toggle-publicidad').checked     = cfg.feature_publicidad;
    document.getElementById('toggle-notificaciones').checked = cfg.feature_notificaciones;
    document.getElementById('toggle-suscriptores').checked   = cfg.feature_suscriptores;

    // ── Listeners de cambio de toggles ───────────────────────────────────────
    const toggles = [
        { id: 'toggle-publicidad',     key: 'feature_publicidad'     },
        { id: 'toggle-notificaciones', key: 'feature_notificaciones'  },
        { id: 'toggle-suscriptores',   key: 'feature_suscriptores'    },
    ];

    toggles.forEach(({ id, key }) => {
        document.getElementById(id).addEventListener('change', async (e) => {
            const valor = e.target.checked;

            // Guardar el nuevo estado en storage
            await chrome.storage.sync.set({ [key]: valor });

            // El SW reacciona via onChanged automáticamente.
            // Mostrar banner de recarga si hay tabs cubiertas abiertas.
            actualizarBannerRecarga();
        });
    });

    // ── Botón "Recargar ahora" ────────────────────────────────────────────────
    document.getElementById('btn-reload').addEventListener('click', async () => {
        const tabsCubiertas = await obtenerTabsCubiertas();
        for (const tab of tabsCubiertas) {
            chrome.tabs.reload(tab.id);
        }
        const wrapper = document.getElementById('reload-banner-wrapper');
        if (wrapper) {
            wrapper.classList.remove('visible');
        }
    });

    // ── Verificar al abrir si ya hay tabs cubiertas ──────────────────────────
    // El banner se activa únicamente al modificar un toggle.
});
