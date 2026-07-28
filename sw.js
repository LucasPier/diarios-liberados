const DOMAINS = ["www.lacapital.com.ar", "flipbook.lacapital.com.ar", "www.lavoz.com.ar", "www.lagaceta.com.ar", "www.clarin.com", "elle.clarin.com", "www.lanacion.com.ar", "www.infobae.com", "www.ellitoral.com", "www.rosario3.com", "www.lapoliticaonline.com", "www.pagina12.com.ar", "www.cronista.com", "www.ambito.com", "www.eldestapeweb.com", "www.perfil.com", "noticias.perfil.com", "442.perfil.com", "caras.perfil.com", "parabrisas.perfil.com", "fortuna.perfil.com", "weekend.perfil.com", "supercampo.perfil.com", "look.perfil.com", "luz.perfil.com", "mia.perfil.com", "lunateen.perfil.com", "horizonte.perfil.com", "exitoina.perfil.com", "brasil.perfil.com", "marieclaire.perfil.com", "radio.perfil.com", "canalnet.tv", "rouge.perfil.com", "hombre.perfil.com", "batimes.com.ar", "www.ole.com.ar", "www.elciudadanoweb.com", "viapais.com.ar", "www.diariopopular.com.ar", "www.eltrecetv.com.ar", "www.radiomitre.com.ar", "www.tycsports.com", "www.ciudad.com.ar", "www.tn.com.ar", "ar.cienradios.com", "radiomitre.cienradios.com", "la100.cienradios.com", "mia.cienradios.com", "www.kenja.tech", "www.minutouno.com", "imasdk.googleapis.com"];

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
      initiatorDomains: Array.from(DOMAINS).filter(d => d !== "www.diariopopular.com.ar"),
    },
  },
  {
    // Publicidad - CDN de Wyleex (proveedor de ads de La Voz / La Gaceta)
    id: 3,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "cdn.wyleex.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - AdZone (red de anuncios display)
    id: 4,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".adzonestatic.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - IMA SDK de Google (anuncios de video in-stream)
    id: 5,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "imasdk.googleapis.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Snigelweb ad engine (proveedor de ads programáticos)
    id: 6,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adengine.snigelweb.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Vidoomy (red de video ads)
    id: 7,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".vidoomy.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Zonda via CloudFront (plataforma de ads de La Voz / La Gaceta)
    id: 8,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "d323qqnnjmo65t.cloudfront.net/zonda",
      initiatorDomains: ["www.lavoz.com.ar", "www.lagaceta.com.ar"],
    },
  },
  {
    // Publicidad - Taboola (contenido patrocinado / anuncios nativos)
    id: 9,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".taboola.",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - MGID (red de anuncios nativos)
    id: 10,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".mgid.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - PubMatic (plataforma de SSP/programática)
    id: 11,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".pubmatic.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Zonda-Wyleex en La Voz (sistema propio de ads)
    id: 12,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "zonda-wyleex.lavoz.com.ar",
      initiatorDomains: ["www.lavoz.com.ar"],
    },
  },
  {
    // Publicidad - Zonda DevOps (infraestructura de ads de La Voz / La Gaceta)
    id: 13,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".zondadevops.com",
      initiatorDomains: ["www.lavoz.com.ar", "www.lagaceta.com.ar"],
    },
  },
  {
    // Publicidad - SiteScout pixel de tracking/sincronización de audiencias
    id: 16,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "pixel-sync.sitescout.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Seedtag (red de anuncios contextuales)
    id: 17,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".seedtag.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - ID5 (sincronización de identidad para targeting publicitario)
    id: 18,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".id5-sync.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - e-Planning (plataforma de ad serving latinoamericana)
    id: 19,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".e-planning.",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Google Analytics (tracking de usuarios para segmentación publicitaria)
    id: 20,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "google-analytics.com,",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - AppNexus/Xandr (plataforma de DSP/SSP programática)
    id: 21,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adnxs.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - AdTech (plataforma de ad serving)
    id: 22,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adtech.de",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - AdForm (DSP/plataforma de gestión de campañas)
    id: 23,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adform.net",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - AdRoll (plataforma de retargeting)
    id: 24,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adroll.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Scorecard Research (medición de audiencia / Comscore)
    id: 25,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "scorecardresearch.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Mathtag/MediaMath (DSP de compra programática)
    id: 26,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "mathtag.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Segment.io (plataforma de datos de usuario para publicidad)
    id: 27,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "segment.io",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    // Publicidad - Bloqueo genérico de scripts "ads.js" (cargadores de publicidad)
    id: 28,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "ads.js",
      initiatorDomains: DOMAINS, // Global,
    },
  }
];

// Reglas de red dinámicas aplicadas vía declarativeNetRequest.
// Todas las reglas de este bloque corresponden a: Suscriptores
const RULES_SUSCRIPTORES = [
  {
    // Suscriptores (La Gaceta) - Script SWG (Subscribe with Google) propio del sitio, gestiona el paywall
    id: 14,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "www.lagaceta.com.ar/js/sus/swg-merge",
      initiatorDomains: ["www.lagaceta.com.ar"],
    },
  },
  {
    // Suscriptores (La Voz / La Gaceta) - Zonda (plataforma de gestión de suscripciones y paywall)
    id: 15,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "zonda.lavoz.com.ar",
      initiatorDomains: ["www.lavoz.com.ar", "www.lagaceta.com.ar"],
    },
  },
  {
    // Suscriptores (La Gaceta) - Librería SWG-JS oficial de Google (Subscribe with Google), activa el muro de pago
    id: 29,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "raw.githubusercontent.com/subscriptions-project/swg-js",
      initiatorDomains: ["www.lagaceta.com.ar"],
    },
  }
];

// Combinamos ambos arrays para registrar todas las reglas de una sola vez.
const RULES = [...RULES_PUBLICIDAD, ...RULES_SUSCRIPTORES];

// Primero limpiamos cualquier regla previa con esos IDs,
// y recién después agregamos las nuevas. Dos llamadas separadas
// para evitar conflictos por IDs duplicados entre sesiones.
chrome.declarativeNetRequest.updateDynamicRules(
  { removeRuleIds: RULES.map((r) => r.id) },
  () => {
    if (chrome.runtime.lastError) {
      console.error("Error al remover reglas:", chrome.runtime.lastError.message);
      return;
    }

    chrome.declarativeNetRequest.updateDynamicRules(
      { addRules: RULES },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error al agregar reglas:", chrome.runtime.lastError.message);
          return;
        }
        console.log("Reglas de bloqueo aplicadas correctamente.");
      }
    );
  }
);