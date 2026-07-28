/**
 * loader.js — Cargador genérico de CSS por feature
 *
 * Consulta la configuración del usuario en chrome.storage.sync y,
 * en base a SITE_CSS_MAP (site-map.js), inyecta dinámicamente solo los
 * CSS correspondientes a las features habilitadas para el sitio actual.
 *
 * Busca en SITE_CSS_MAP probando el hostname exacto, la versión sin 'www.'
 * y la versión con 'www.' para garantizar que funcione independientemente de cómo
 * esté formateada la URL ingresada por el usuario.
 *
 * Dependencias (deben cargarse antes en el manifest):
 *   - js/config.js   → getConfig()
 *   - js/css-loader.js → injectCSS()
 *   - js/site-map.js → SITE_CSS_MAP
 */

function getSiteCssConfig(map, hostname) {
    if (!map) return {};
    if (map[hostname]) return map[hostname];

    const cleanHost = hostname.replace(/^www\./, '');
    if (map[cleanHost]) return map[cleanHost];

    const wwwHost = 'www.' + cleanHost;
    if (map[wwwHost]) return map[wwwHost];

    return {};
}

if (typeof window.__dlLoaderLoaded === 'undefined') {
    window.__dlLoaderLoaded = true;

    getConfig().then(cfg => {
        const map = typeof SITE_CSS_MAP !== 'undefined' ? SITE_CSS_MAP : window.SITE_CSS_MAP;
        const siteCss = getSiteCssConfig(map, location.hostname);

        // Inyectar CSS condicionalmente según config del usuario
        if (cfg.feature_publicidad && siteCss.publicidad) {
            siteCss.publicidad.forEach(injectCSS);
        }
        if (cfg.feature_notificaciones && siteCss.notificaciones) {
            siteCss.notificaciones.forEach(injectCSS);
        }
        if (cfg.feature_suscriptores && siteCss.suscriptores) {
            siteCss.suscriptores.forEach(injectCSS);
        }

        // Exponer config en dataset para que scripts MAIN world puedan leerla.
        document.documentElement.dataset.dlSuscriptores   = cfg.feature_suscriptores;
        document.documentElement.dataset.dlPublicidad     = cfg.feature_publicidad;
        document.documentElement.dataset.dlNotificaciones = cfg.feature_notificaciones;
    });
}
