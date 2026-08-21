/**
 * airedesantafe.js — Handler de navegación SPA (world: ISOLATED)
 *
 * Escucha el evento "dl:navigate" disparado por airedesantafe-spa.js
 * (world: MAIN) y reinyecta los CSS de la extensión, ya que la navegación
 * client-side del sitio descarta los <link> previamente inyectados.
 *
 * Dependencias (cargadas antes en el manifest):
 *   - js/config.js     → getConfig()
 *   - js/css-loader.js → injectCSS()
 *   - js/site-map.js   → SITE_CSS_MAP
 */

console.log('Diarios Liberados — airedesantafe activo');

function dlReinyectarCSS() {
    const cssPrefix = chrome.runtime.getURL('');

    // Eliminar los <link> previos de la extensión para que injectCSS
    // no los considere "ya inyectados" y los vuelva a crear.
    document.querySelectorAll(`link[href^="${cssPrefix}"]`).forEach(el => el.remove());

    // Reutilizar la lógica del loader: leer config e inyectar según features
    getConfig().then(cfg => {
        const map = typeof SITE_CSS_MAP !== 'undefined' ? SITE_CSS_MAP : window.SITE_CSS_MAP;
        const siteCss = getSiteCssConfig(map, location.hostname);

        if (cfg.feature_publicidad && siteCss.publicidad) {
            siteCss.publicidad.forEach(injectCSS);
        }
        if (cfg.feature_notificaciones && siteCss.notificaciones) {
            siteCss.notificaciones.forEach(injectCSS);
        }
        if (cfg.feature_suscriptores && siteCss.suscriptores) {
            siteCss.suscriptores.forEach(injectCSS);
        }
    });
}

// Escuchar el evento custom disparado por el script MAIN
window.addEventListener('dl:navigate', dlReinyectarCSS);