const DOMAINS = ["www.lacapital.com.ar", "flipbook.lacapital.com.ar", "www.lavoz.com.ar", "www.clarin.com", "elle.clarin.com", "www.lanacion.com.ar", "www.infobae.com", "www.ellitoral.com", "www.rosario3.com", "www.lapoliticaonline.com", "www.pagina12.com.ar", "www.cronista.com", "www.ambito.com", "www.eldestapeweb.com", "www.perfil.com", "noticias.perfil.com", "442.perfil.com", "caras.perfil.com", "parabrisas.perfil.com", "fortuna.perfil.com", "weekend.perfil.com", "supercampo.perfil.com", "look.perfil.com", "luz.perfil.com", "mia.perfil.com", "lunateen.perfil.com", "horizonte.perfil.com", "exitoina.perfil.com", "brasil.perfil.com", "marieclaire.perfil.com", "radio.perfil.com", "canalnet.tv", "rouge.perfil.com", "hombre.perfil.com", "batimes.com.ar", "www.ole.com.ar", "www.elciudadanoweb.com", "viapais.com.ar", "www.diariopopular.com.ar", "www.eltrecetv.com.ar", "www.radiomitre.com.ar", "www.tycsports.com", "www.ciudad.com.ar", "www.tn.com.ar", "ar.cienradios.com", "radiomitre.cienradios.com", "la100.cienradios.com", "mia.cienradios.com", "www.kenja.tech", "www.minutouno.com", "imasdk.googleapis.com"];
const RULES = [
  {
    id: 2,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".doubleclick.net",
      initiatorDomains: Array.from(DOMAINS).filter(d => d !== "www.diariopopular.com.ar"),
    },
  },
  {
    id: 3,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "cdn.wyleex.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 4,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".adzonestatic.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 5,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "imasdk.googleapis.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 6,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adengine.snigelweb.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 7,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".vidoomy.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 8,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "d323qqnnjmo65t.cloudfront.net/zonda/pw.js",
      initiatorDomains: ["www.lavoz.com.ar"],
    },
  },
  {
    id: 9,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".taboola.",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 10,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".mgid.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 11,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".pubmatic.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 12,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "zonda-wyleex.lavoz.com.ar",
      initiatorDomains: ["www.lavoz.com.ar"],
    },
  },
  {
    id: 13,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".zondadevops.com",
      initiatorDomains: ["www.lavoz.com.ar"],
    },
  },
  {
    id: 16,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "pixel-sync.sitescout.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 17,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".seedtag.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 18,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".id5-sync.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 19,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: ".e-planning.",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 20,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "google-analytics.com,",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 21,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adnxs.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 22,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adtech.de",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 23,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adform.net",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 24,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "adroll.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 25,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "scorecardresearch.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 26,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "mathtag.com",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 27,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "segment.io",
      initiatorDomains: DOMAINS, // Global,
    },
  },
  {
    id: 28,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "ads.js",
      initiatorDomains: DOMAINS, // Global,
    },
  }
];

//https://r.prcdn.co/scripts/se2sky/3.52.4-beta.40/viewer.nolibs.build.min.js

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