// Catálogo declarativo de cookies de suscripción, compartido con los content scripts.
// Expone COOKIE_TTL_MINUTOS, COOKIE_RENOVACION_MINUTOS, COOKIES_SUSCRIPTORES y valorCookie().
// Va en try/catch por el mismo motivo que la guarda de apisDeCookiesDisponibles(): si el
// catálogo no carga, el heartbeat se desactiva solo pero las reglas de red siguen andando.
try {
    importScripts("/js/cookies-suscriptores.js");
} catch (e) {
    console.error("No se pudo cargar el catálogo de cookies de suscriptores:", e);
}

const BASE_DOMAINS = [
    "lacapital.com.ar", "flipbook.lacapital.com.ar", "lavoz.com.ar", "lagaceta.com.ar",
    "clarin.com", "elle.clarin.com", "lanacion.com.ar", "infobae.com", "ellitoral.com",
    "puertonegocios.com", "rosario3.com", "lapoliticaonline.com", "pagina12.com.ar",
    "cronista.com", "ambito.com", "eldestapeweb.com", "perfil.com", "noticias.perfil.com",
    "442.perfil.com", "caras.perfil.com", "parabrisas.perfil.com", "fortuna.perfil.com",
    "weekend.perfil.com", "supercampo.perfil.com", "look.perfil.com", "luz.perfil.com",
    "mia.perfil.com", "lunateen.perfil.com", "horizonte.perfil.com", "exitoina.perfil.com",
    "brasil.perfil.com", "marieclaire.perfil.com", "radio.perfil.com", "canalnet.tv",
    "rouge.perfil.com", "hombre.perfil.com", "batimes.com.ar", "ole.com.ar",
    "elciudadanoweb.com", "viapais.com.ar", "diariopopular.com.ar", "eltrecetv.com.ar",
    "radiomitre.com.ar", "tycsports.com", "ciudad.com.ar", "tn.com.ar", "cienradios.com",
    "ar.cienradios.com", "radiomitre.cienradios.com", "la100.cienradios.com",
    "mia.cienradios.com", "kenja.tech", "minutouno.com", "letrap.com.ar", "mdzol.com",
    "losandes.com.ar", "eldia.com", "rionegro.com.ar", "diariouno.com.ar", "unosantafe.com.ar",
    "unoentrerios.com.ar", "elonce.com", "airedesantafe.com.ar", "cadena3.com", "rosarioplus.com",
    "imasdk.googleapis.com", "somosohlala.com", "rollingstone.com", "datafactory.elonce.com"
];

// Incluye dominios apex y subdominios www. para matchear sin importar si el usuario usa www o no
const DOMAINS = Array.from(new Set([
    ...BASE_DOMAINS,
    ...BASE_DOMAINS.map(d => d.startsWith('www.') ? d : `www.${d}`)
]));

// Reglas de red dinámicas aplicadas vía declarativeNetRequest.
// Todas las reglas de este bloque corresponden a: Publicidad
const RULES_PUBLICIDAD = [
    {
        // Publicidad - Red publicitaria DoubleClick/Google Ads (excluye Diario Popular y Ohlalá por incompatibilidad)
        id: 2,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "doubleclick.net",
            initiatorDomains: DOMAINS.filter(d => d !== "www.diariopopular.com.ar" && d !== "diariopopular.com.ar" && d !== "www.somosohlala.com" && d !== "somosohlala.com"),
        },
    },
    {
        // Publicidad - AdZone (red de anuncios display)
        id: 4,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".adzonestatic.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - IMA SDK de Google (anuncios de video in-stream)
        id: 5,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "imasdk.googleapis.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Snigelweb ad engine (proveedor de ads programáticos)
        id: 6,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adengine.snigelweb.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Vidoomy (red de video ads)
        id: 7,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".vidoomy.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Zonda via CloudFront (plataforma de ads de La Voz / La Gaceta)
        id: 8,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "d323qqnnjmo65t.cloudfront.net/zonda",
            initiatorDomains: ["www.lavoz.com.ar", "lavoz.com.ar", "www.lagaceta.com.ar", "lagaceta.com.ar"],
        },
    },
    {
        // Publicidad - Taboola (contenido patrocinado / anuncios nativos)
        id: 9,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".taboola.",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - MGID (red de anuncios nativos)
        id: 10,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".mgid.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - PubMatic (plataforma de SSP/programática)
        id: 11,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".pubmatic.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Zonda-Wyleex en La Voz (sistema propio de ads)
        id: 12,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "zonda-wyleex.lavoz.com.ar",
            initiatorDomains: ["www.lavoz.com.ar", "lavoz.com.ar"],
        },
    },
    {
        // Publicidad - SiteScout pixel de tracking/sincronización de audiencias
        id: 16,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "pixel-sync.sitescout.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Seedtag (red de anuncios contextuales)
        id: 17,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".seedtag.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - ID5 (sincronización de identidad para targeting publicitario)
        id: 18,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".id5-sync.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - e-Planning (plataforma de ad serving latinoamericana)
        id: 19,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".e-planning.",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Google Analytics (tracking de usuarios para segmentación publicitaria)
        id: 20,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google-analytics.com,",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - AppNexus/Xandr (plataforma de DSP/SSP programática)
        id: 21,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adnxs.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - AdTech (plataforma de ad serving)
        id: 22,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adtech.de",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - AdForm (DSP/plataforma de gestión de campañas)
        id: 23,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adform.net",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - AdRoll (plataforma de retargeting)
        id: 24,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adroll.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Scorecard Research (medición de audiencia / Comscore)
        id: 25,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "scorecardresearch.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Mathtag/MediaMath (DSP de compra programática)
        id: 26,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "mathtag.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Segment.io (plataforma de datos de usuario para publicidad)
        id: 27,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "segment.io",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo genérico de scripts "ads.js" (cargadores de publicidad)
        id: 28,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "ads.js",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts smartadserver
        id: 30,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "smartadserver.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Trackeo Dos al Cubo
        id: 32,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "racker.thinkindot.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Tadevel (proveedor de publicidad y tracking)
        id: 35,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "static/adder",
            initiatorDomains: ["www.rosarioplus.com", "rosarioplus.com"],
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads (pagead2.googlesyndication.com)
        id: 36,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "pagead2.googlesyndication.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Advanced Ads (plugin de WordPress para gestión de publicidad)
        id: 37,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "wp-content/plugins/advanced-ads",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de remarketing de Google Ads (google.com/rmkt)
        id: 38,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com/rmkt",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de LinkedIn Ads (ads.linkedin.com)
        id: 39,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "ads.linkedin.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de LinkedIn Ads (ads.linkedin.com)
        id: 40,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "ads.linkedin.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads (google.com.ar/ads)
        id: 41,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com.ar/ads",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads (google.com/ccm)
        id: 42,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com/ccm",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Amazon Ads (amazon-adsystem.com)
        id: 43,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "amazon-adsystem.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads (googleadservices.com)
        id: 44,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "googleadservices.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads (google.com/pagead)
        id: 45,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com/pagead",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Ad Delivery (ad-delivery.net)
        id: 46,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "ad-delivery.net",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Teads (teads.tv)
        id: 47,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "teads.tv",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de MFAdsRvr (mfadsrvr.com)
        id: 48,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "mfadsrvr.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Smart AdServer (smartadserver.com)
        id: 49,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "smartadserver.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de OneTag (onetag-sys.com)
        id: 50,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "onetag-sys.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de PubMatic (pubmatic.com)
        id: 51,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "pubmatic.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de The Moneytizer (themoneytizer.com)
        id: 52,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "themoneytizer.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Between Digital (betweendigital.com)
        id: 53,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "betweendigital.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de 4Dex (c.4dex.io)
        id: 54,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "c.4dex.io",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Adnami (adnami.io)
        id: 55,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adnami.io",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de The Trade Desk (adsrvr.org)
        id: 56,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adsrvr.org",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de DoubleVerify (doubleverify.com)
        id: 57,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "doubleverify.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de AdsWizz (adswizz.com)
        id: 58,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "adswizz.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads Measurement (google.com/measurement)
        id: 59,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com/measurement",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Analytics (analytics.google.com)
        id: 60,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "analytics.google.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Analytics (google-analytics.com)
        id: 61,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google-analytics.com",
            initiatorDomains: DOMAINS.filter(d => d !== "perfil.com" && !d.endsWith(".perfil.com")),
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Google Ads Collect (google.com/g/collect)
        id: 62,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "google.com/g/collect",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de Chartbeat (chartbeat.com)
        id: 63,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "chartbeat.",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de publicidad de video (Rosario3)
        id: 64,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "videojs.ads.min.js",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de retargetly.com (ambito.com)
        id: 65,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "retargetly.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de scripts de viads.com (minutouno.com)
        id: 66,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "viads.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de script videojs-contrib-ads (minutouno.com)
        id: 67,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "videojs.ads",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Publicidad - Bloqueo de script brilliantchap.com (Perfil)
        id: 68,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "brilliantchap.com",
            initiatorDomains: DOMAINS,
        },
    }
];

// Reglas de red dinámicas aplicadas vía declarativeNetRequest.
// Todas las reglas de este bloque corresponden a: Suscriptores
const RULES_SUSCRIPTORES = [
    {
        // Suscriptores - CDN de Wyleex (proveedor de La Capital / La Voz / La Gaceta)
        id: 3,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "cdn.wyleex.com",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Suscriptores (La Voz / La Gaceta) - Zonda DevOps
        id: 13,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".zondadevops.com",
            initiatorDomains: ["www.lavoz.com.ar", "lavoz.com.ar", "www.lagaceta.com.ar", "lagaceta.com.ar"],
        },
    },
    {
        // Suscriptores (La Gaceta) - Script SWG (Subscribe with Google) propio del sitio, gestiona el paywall
        id: 14,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "www.lagaceta.com.ar/js/sus/swg-merge",
            initiatorDomains: ["www.lagaceta.com.ar", "lagaceta.com.ar"],
        },
    },
    {
        // Suscriptores (La Voz / La Gaceta) - Zonda (plataforma de gestión de suscripciones y paywall)
        id: 15,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "zonda.lavoz.com.ar",
            initiatorDomains: ["www.lavoz.com.ar", "lavoz.com.ar", "www.lagaceta.com.ar", "lagaceta.com.ar"],
        },
    },
    {
        // Suscriptores (La Gaceta) - Librería SWG-JS oficial de Google (Subscribe with Google), activa el muro de pago
        id: 29,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "raw.githubusercontent.com/subscriptions-project/swg-js",
            initiatorDomains: ["www.lagaceta.com.ar", "lagaceta.com.ar"],
        },
    }
];

// Reglas de red dinámicas aplicadas vía declarativeNetRequest.
// Todas las reglas de este bloque corresponden a: Notificaciones
const RULES_NOTIFICACIONES = [
    {
        // Notificaciones - Bloqueo de Gravitec para desactivar notificaciones push
        id: 31,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "gravitec.net/",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Notificaciones - Bloqueo de OneSignal para desactivar notificaciones push
        id: 33,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "onesignal.com/",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Notificaciones - Bloqueo de OneSignal para desactivar notificaciones push
        id: 34,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "OneSignalSDKFiles",
            initiatorDomains: DOMAINS,
        },
    },
    {
        // Notificaciones - Bloqueo de InMobi para desactivar modales
        id: 69,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "inmobi.com",
            initiatorDomains: DOMAINS,
        },
    }
];

// ID del ruleset estático (rules.json) — aplica sólo a la feature "suscriptores"
const STATIC_RULESET_ID = "ruleset_lagaceta";

let isApplyingRules = false;
let pendingApply = false;

/**
 * Aplica las reglas declarativeNetRequest según la config del usuario.
 * Serializa la ejecución mediante un lock (isApplyingRules) para evitar
 * ejecuciones concurrentes y colisiones de IDs en llamadas asincrónicas simultáneas.
 */
async function applyRules() {
    if (isApplyingRules) {
        pendingApply = true;
        return;
    }
    isApplyingRules = true;

    try {
        do {
            pendingApply = false;

            const cfg = await chrome.storage.sync.get({
                feature_publicidad: true,
                feature_suscriptores: true,
                feature_notificaciones: true
            });

            // Construir el conjunto de reglas a activar según config
            const rulesToAdd = [
                ...(cfg.feature_publicidad ? RULES_PUBLICIDAD : []),
                ...(cfg.feature_suscriptores ? RULES_SUSCRIPTORES : []),
                ...(cfg.feature_notificaciones ? RULES_NOTIFICACIONES : []),
            ];

            // Obtener de Chrome todas las reglas dinámicas actualmente instaladas
            const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
            const removeRuleIds = currentRules.map(r => r.id);

            // Actualización atómica en una sola llamada
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: removeRuleIds,
                addRules: rulesToAdd
            });

            console.log(`Reglas aplicadas correctamente (${rulesToAdd.length} reglas activas).`);

            // Habilitar/deshabilitar el ruleset estático (rules.json) según suscriptores
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: cfg.feature_suscriptores ? [STATIC_RULESET_ID] : [],
                disableRulesetIds: cfg.feature_suscriptores ? [] : [STATIC_RULESET_ID],
            });
        } while (pendingApply);
    } catch (e) {
        console.error("Error al actualizar reglas declarativeNetRequest:", e);
    } finally {
        isApplyingRules = false;
    }
}

// Aplicar reglas al iniciar el Service Worker
applyRules();

// Re-aplicar reglas cuando el usuario cambia la configuración desde el popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if ('feature_publicidad' in changes || 'feature_suscriptores' in changes || 'feature_notificaciones' in changes) {
        applyRules();
    }
});

// ============================================================================
// Suscriptores - Heartbeat de cookies
//
// Chrome no ofrece ningún hook de desinstalación o desactivación donde correr limpieza, así
// que las cookies no pueden depender de que alguien las borre: tienen que morir solas. Las
// escribimos con TTL corto y las renovamos desde acá mientras la extensión esté viva. Al
// desactivarla o desinstalarla el service worker deja de existir, la alarma no vuelve a
// dispararse y las cookies vencen sin intervención de nadie.
//
// El heartbeat corre en el service worker y no en los content scripts por tres motivos:
// mantiene las cookies vigentes sin ninguna pestaña del diario abierta (así viajan en la
// primera request de navegación), es inmune al throttling de timers de las pestañas de fondo,
// y muere de verdad cuando la extensión muere (un content script huérfano seguiría corriendo).
// Ver cookies-suscriptores.js para el porqué de los valores de TTL y renovación.
// ============================================================================

const COOKIE_ALARMA = "renovar-cookies-suscriptores";

// El service worker despierta por la alarma y vuelve a evaluar su scope global, con lo cual el
// arranque y el onAlarm pedirían renovar dos veces seguidas. Este guard colapsa esos duplicados
// dentro de una misma instancia.
let ultimaRenovacionCookies = 0;

async function leerOverridesCookies() {
    try {
        const { cookie_overrides } = await chrome.storage.local.get({ cookie_overrides: {} });
        return cookie_overrides;
    } catch {
        return {};
    }
}

/**
 * ¿La cookie es nuestra? Si está marcada preservarExistente y ya hay una con un valor distinto
 * del que escribiríamos, es la credencial real del usuario: ni la pisamos ni la borramos.
 */
async function esCookiePropia(url, cookie) {
    if (!cookie.preservarExistente) return true;
    try {
        const actual = await chrome.cookies.get({ url, name: cookie.nombre });
        return !actual || actual.value === cookie.valor;
    } catch {
        return false;
    }
}

/**
 * Recorre el catálogo aplicando `accion` a cada par (url, cookie) que nos pertenece.
 *
 * Una tarea que falla no aborta al resto: cada host y cada cookie son independientes, y perder
 * una no tiene por qué costar las otras 165. El detalle se reporta por nombre porque
 * chrome.cookies.set valida el valor más estricto que document.cookie (la coma de
 * ProductoPremiumId, por ejemplo): si alguna cookie del catálogo no le gusta, tiene que
 * aparecer identificada en la consola del service worker y no como un número.
 */
async function recorrerCookiesSuscriptores(accion) {
    const overrides = await leerOverridesCookies();
    const tareas = [];
    const fallidas = [];

    for (const grupo of COOKIES_SUSCRIPTORES) {
        const valores = overrides[grupo.id];
        for (const host of grupo.hosts) {
            const url = `https://${host}/`;
            for (const cookie of grupo.cookies) {
                tareas.push((async () => {
                    try {
                        if (!await esCookiePropia(url, cookie)) return;
                        await accion(url, cookie, valores);
                    } catch (e) {
                        fallidas.push(`${host}/${cookie.nombre}: ${e?.message || e}`);
                    }
                })());
            }
        }
    }

    await Promise.all(tareas);

    if (fallidas.length) {
        // Se agrupan por cookie: si falla una, falla en todos sus hosts y el log sería ilegible.
        const porCookie = [...new Set(fallidas.map(f => f.split("/")[1]))];
        console.warn(`Cookies de suscriptores: fallaron ${fallidas.length} de ${tareas.length} operaciones.`, porCookie);
    }
    return tareas.length - fallidas.length;
}

/** Reescribe todas las cookies del catálogo con un vencimiento nuevo de COOKIE_TTL_MINUTOS. */
async function renovarCookies() {
    if (Date.now() - ultimaRenovacionCookies < 5000) return;
    ultimaRenovacionCookies = Date.now();

    const expirationDate = Math.floor(Date.now() / 1000) + COOKIE_TTL_MINUTOS * 60;

    // Sin atributo `domain`: quedan host-only, igual que cuando las escribía document.cookie.
    await recorrerCookiesSuscriptores((url, cookie, valores) => chrome.cookies.set({
        url,
        name: cookie.nombre,
        value: valorCookie(cookie, valores),
        path: "/",
        expirationDate,
    }));
}

/**
 * Borra las cookies sin esperar a que venzan. Se usa cuando el usuario apaga la feature desde
 * el popup: antes había que visitar cada diario para que su content script las limpiara, y si
 * no lo hacías quedaban los 90 días completos.
 */
async function borrarCookiesSuscriptores() {
    ultimaRenovacionCookies = 0;
    const borradas = await recorrerCookiesSuscriptores((url, cookie) => chrome.cookies.remove({
        url,
        name: cookie.nombre,
    }));
    console.log(`Cookies de suscriptores eliminadas (${borradas} operaciones).`);
}

/** Alinea el heartbeat con la config: lo enciende y renueva, o lo apaga y limpia. */
async function sincronizarCookies() {
    try {
        const { feature_suscriptores } = await chrome.storage.sync.get({ feature_suscriptores: true });

        if (!feature_suscriptores) {
            await chrome.alarms.clear(COOKIE_ALARMA);
            await borrarCookiesSuscriptores();
            return;
        }

        await chrome.alarms.create(COOKIE_ALARMA, { periodInMinutes: COOKIE_RENOVACION_MINUTOS });
        await renovarCookies();
    } catch (e) {
        console.error("Error al sincronizar las cookies de suscriptores:", e);
    }
}

/**
 * ¿Están disponibles las APIs que necesita el heartbeat?
 *
 * Al recargar una extensión desempaquetada después de tocar "permissions", Chrome refresca el
 * código pero no siempre re-aplica los permisos: el service worker nuevo corre con chrome.cookies
 * y chrome.alarms todavía en undefined. Sin esta guarda, el TypeError resultante aborta la
 * evaluación del service worker COMPLETO y se caen también las reglas de publicidad y de
 * notificaciones. El heartbeat es una feature opcional: si no puede arrancar, se desactiva sola
 * y deja el resto funcionando.
 */
function apisDeCookiesDisponibles() {
    const faltantes = [];
    if (!chrome.cookies) faltantes.push("cookies");
    if (!chrome.alarms) faltantes.push("alarms");
    if (typeof COOKIES_SUSCRIPTORES === "undefined") faltantes.push("catálogo cookies-suscriptores.js");

    if (faltantes.length) {
        console.error(
            `Heartbeat de cookies desactivado, falta: ${faltantes.join(", ")}. ` +
            `Si los permisos están en el manifest, Chrome no lo releyó: quitá la extensión ` +
            `y volvé a cargarla en chrome://extensions (recargar no alcanza al cambiar permisos).`
        );
        return false;
    }
    return true;
}

if (apisDeCookiesDisponibles()) {
    chrome.alarms.onAlarm.addListener(alarma => {
        if (alarma.name === COOKIE_ALARMA) renovarCookies();
    });

    // onInstalled cubre la migración: pisa las cookies de 90 días de versiones anteriores con el
    // TTL corto (mismo nombre, host y path = misma cookie), sin necesidad de visitar los diarios.
    chrome.runtime.onInstalled.addListener(sincronizarCookies);
    chrome.runtime.onStartup.addListener(sincronizarCookies);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && 'feature_suscriptores' in changes) {
            sincronizarCookies();
            return;
        }
        // Un content script publicó valores calculados desde la página (ej. el ID de usuario real
        // de La Nación): reescribimos para no seguir renovando con el default del catálogo.
        if (area === 'local' && 'cookie_overrides' in changes) {
            ultimaRenovacionCookies = 0;
            renovarCookies();
        }
    });

    // Arranque en frío del service worker
    sincronizarCookies();
}