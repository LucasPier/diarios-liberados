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
    "losandes.com.ar", "eldia.com", "rionegro.com.ar", "diariouno.com.ar", "imasdk.googleapis.com"
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
        // Publicidad - Red publicitaria DoubleClick/Google Ads (excluye Diario Popular por incompatibilidad)
        id: 2,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: ".doubleclick.net",
            initiatorDomains: DOMAINS.filter(d => d !== "www.diariopopular.com.ar" && d !== "diariopopular.com.ar"),
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
        // Publicidad - Bloqueo genérico de scripts "ad.js" (cargadores de publicidad)
        id: 30,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "smartadserver.com",
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