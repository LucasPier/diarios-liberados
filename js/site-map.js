/**
 * site-map.js — Mapa centralizado de CSS por sitio y feature
 *
 * Define qué archivos CSS corresponden a cada feature (publicidad, notificaciones, suscriptores)
 * para cada hostname cubierto por la extensión.
 *
 * Encapsulado en una IIFE para evitar redeclaraciones de constantes cuando un dominio
 * inyecta múltiples content scripts en la misma página (ej: La Nación a document_start y document_end).
 */

var SITE_CSS_MAP = window.SITE_CSS_MAP || (function () {
    const elciudadanoConfig = {
        publicidad:     ['css/elciudadano-publicidad.css'],
        notificaciones: ['css/elciudadano-notificaciones.css'],
        suscriptores:   []
    };

    const clarinConfig = {
        publicidad:     ['css/clarin-publicidad.css'],
        notificaciones: [],
        suscriptores:   ['css/clarin-suscriptores.css']
    };

    const oleConfig = {
        publicidad:     ['css/ole-publicidad.css'],
        notificaciones: [],
        suscriptores:   ['css/ole-suscriptores.css']
    };

    const lanacionConfig = {
        publicidad:     ['css/lanacion-publicidad.css'],
        notificaciones: ['css/lanacion-notificaciones.css'],
        suscriptores:   ['css/lanacion-suscriptores.css']
    };

    const lacapitalConfig = {
        publicidad:     ['css/lacapital-publicidad.css'],
        notificaciones: ['css/lacapital-notificaciones.css'],
        suscriptores:   ['css/lacapital-suscriptores.css']
    };

    const lavozConfig = {
        publicidad:     ['css/lavoz-publicidad.css'],
        notificaciones: ['css/lavoz-notificaciones.css'],
        suscriptores:   ['css/lavoz-suscriptores.css']
    };

    const lagacetaConfig = {
        publicidad:     ['css/lagaceta-publicidad.css'],
        notificaciones: ['css/lagaceta-notificaciones.css'],
        suscriptores:   ['css/lagaceta-suscriptores.css']
    };

    const infobaeConfig = {
        publicidad:     ['css/infobae-publicidad.css'],
        notificaciones: ['css/infobae-notificaciones.css'],
        suscriptores:   []
    };

    const ellitoralConfig = {
        publicidad:     ['css/ellitoral-publicidad.css'],
        notificaciones: ['css/ellitoral-notificaciones.css'],
        suscriptores:   ['css/ellitoral-suscriptores.css']
    };

    const rosario3Config = {
        publicidad:     ['css/rosario3-publicidad.css'],
        notificaciones: ['css/rosario3-notificaciones.css'],
        suscriptores:   []
    };

    const lpoConfig = {
        publicidad:     ['css/lpo-publicidad.css'],
        notificaciones: ['css/lpo-notificaciones.css'],
        suscriptores:   []
    };

    const pagina12Config = {
        publicidad:     ['css/pagina12-publicidad.css'],
        notificaciones: ['css/pagina12-notificaciones.css'],
        suscriptores:   ['css/pagina12-suscriptores.css']
    };

    const elcronistaConfig = {
        publicidad:     ['css/elcronista-publicidad.css'],
        notificaciones: ['css/elcronista-notificaciones.css'],
        suscriptores:   ['css/elcronista-suscriptores.css']
    };

    const ambitoConfig = {
        publicidad:     ['css/ambito-publicidad.css'],
        notificaciones: ['css/ambito-notificaciones.css'],
        suscriptores:   ['css/ambito-suscriptores.css']
    };

    const eldestapeConfig = {
        publicidad:     ['css/eldestape-publicidad.css'],
        notificaciones: ['css/eldestape-notificaciones.css'],
        suscriptores:   []
    };

    const perfilConfig = {
        publicidad:     ['css/perfil-publicidad.css'],
        notificaciones: ['css/perfil-notificaciones.css'],
        suscriptores:   ['css/perfil-suscriptores.css']
    };

    const viapaisConfig = {
        publicidad:     ['css/viapais-publicidad.css'],
        notificaciones: ['css/viapais-notificaciones.css'],
        suscriptores:   []
    };

    const diariopopularConfig = {
        publicidad:     ['css/diariopopular-publicidad.css'],
        notificaciones: ['css/diariopopular-notificaciones.css'],
        suscriptores:   []
    };

    const eltrecetvConfig = {
        publicidad:     ['css/eltrecetv-publicidad.css'],
        notificaciones: ['css/eltrecetv-notificaciones.css'],
        suscriptores:   []
    };

    const cienradiosConfig = {
        publicidad:     ['css/cienradios-publicidad.css'],
        notificaciones: ['css/cienradios-notificaciones.css'],
        suscriptores:   []
    };

    const tycsportsConfig = {
        publicidad:     ['css/tycsports-publicidad.css'],
        notificaciones: ['css/tycsports-notificaciones.css'],
        suscriptores:   []
    };

    const ciudadConfig = {
        publicidad:     ['css/ciudad-publicidad.css'],
        notificaciones: ['css/ciudad-notificaciones.css'],
        suscriptores:   []
    };

    const tnConfig = {
        publicidad:     ['css/tn-publicidad.css'],
        notificaciones: ['css/tn-notificaciones.css'],
        suscriptores:   []
    };

    const minutounoConfig = {
        publicidad:     ['css/minutouno-publicidad.css'],
        notificaciones: ['css/minutouno-notificaciones.css'],
        suscriptores:   []
    };

    const letrapConfig = {
        publicidad:     ['css/letrap-publicidad.css'],
        notificaciones: ['css/letrap-notificaciones.css'],
        suscriptores:   []
    };

    const mdzConfig = {
        publicidad:     ['css/mdz-publicidad.css'],
        notificaciones: ['css/mdz-notificaciones.css'],
        suscriptores:   []
    };

    const losandesConfig = {
        publicidad:     ['css/losandes-publicidad.css'],
        notificaciones: ['css/losandes-notificaciones.css'],
        suscriptores:   []
    };

    const eldiaConfig = {
        publicidad:     ['css/eldia-publicidad.css'],
        notificaciones: ['css/eldia-notificaciones.css'],
        suscriptores:   ['css/eldia-suscriptores.css']
    };

    const rionegroConfig = {
        publicidad:     ['css/rionegro-publicidad.css'],
        notificaciones: ['css/rionegro-notificaciones.css'],
        suscriptores:   ['css/rionegro-suscriptores.css']
    };

    const diariounoConfig = {
        publicidad:     ['css/diariouno-publicidad.css'],
        notificaciones: ['css/diariouno-notificaciones.css'],
        suscriptores:   []
    };

    const elonceConfig = {
        publicidad:     ['css/elonce-publicidad.css'],
        notificaciones: ['css/elonce-notificaciones.css'],
        suscriptores:   []
    };

    const airedesantafeConfig = {
        publicidad:     ['css/airedesantafe-publicidad.css'],
        notificaciones: ['css/airedesantafe-notificaciones.css'],
        suscriptores:   []
    };

    const cadena3Config = {
        publicidad:     ['css/cadena3-publicidad.css'],
        notificaciones: ['css/cadena3-notificaciones.css'],
        suscriptores:   []
    };

    return {
        // ── Clarín / Olé ─────────────────────────────────────────
        'www.clarin.com': clarinConfig,
        'clarin.com':     clarinConfig,
        'www.ole.com.ar': oleConfig,
        'ole.com.ar':     oleConfig,
        'elle.clarin.com': { publicidad: ['css/clarin-publicidad.css'], notificaciones: [], suscriptores: [] },

        // ── La Nación ─────────────────────────────────────────────
        'www.lanacion.com.ar': lanacionConfig,
        'lanacion.com.ar':     lanacionConfig,

        // ── La Capital / UNO Santa Fe / UNO Entre Ríos ────────────
        'www.lacapital.com.ar':      lacapitalConfig,
        'lacapital.com.ar':          lacapitalConfig,
        'flipbook.lacapital.com.ar': lacapitalConfig,
        'www.unosantafe.com.ar': lacapitalConfig,
        'unosantafe.com.ar': lacapitalConfig,
        'www.unoentrerios.com.ar': lacapitalConfig,
        'unoentrerios.com.ar': lacapitalConfig,

        // ── La Voz ────────────────────────────────────────────────
        'www.lavoz.com.ar': lavozConfig,
        'lavoz.com.ar':     lavozConfig,

        // ── La Gaceta ─────────────────────────────────────────────
        'www.lagaceta.com.ar': lagacetaConfig,
        'lagaceta.com.ar':     lagacetaConfig,

        // ── Infobae ───────────────────────────────────────────────
        'www.infobae.com': infobaeConfig,
        'infobae.com':     infobaeConfig,

        // ── El Litoral / Puerto Negocios ──────────────────────────
        'www.ellitoral.com':      ellitoralConfig,
        'ellitoral.com':          ellitoralConfig,
        'www.puertonegocios.com': ellitoralConfig,
        'puertonegocios.com':     ellitoralConfig,

        // ── Rosario 3 ─────────────────────────────────────────────
        'www.rosario3.com': rosario3Config,
        'rosario3.com':     rosario3Config,

        // ── La Política Online ────────────────────────────────────
        'www.lapoliticaonline.com': lpoConfig,
        'lapoliticaonline.com':     lpoConfig,

        // ── Página 12 ─────────────────────────────────────────────
        'www.pagina12.com.ar': pagina12Config,
        'pagina12.com.ar':     pagina12Config,

        // ── El Cronista ───────────────────────────────────────────
        'www.cronista.com': elcronistaConfig,
        'cronista.com':     elcronistaConfig,

        // ── Ámbito ────────────────────────────────────────────────
        'www.ambito.com': ambitoConfig,
        'ambito.com':     ambitoConfig,

        // ── El Destape ────────────────────────────────────────────
        'www.eldestapeweb.com': eldestapeConfig,
        'eldestapeweb.com':     eldestapeConfig,

        // ── Perfil y suplementos ──────────────────────────────────
        'www.perfil.com':          perfilConfig,
        'perfil.com':              perfilConfig,
        'noticias.perfil.com':     perfilConfig,
        '442.perfil.com':          perfilConfig,
        'caras.perfil.com':        perfilConfig,
        'parabrisas.perfil.com':   perfilConfig,
        'fortuna.perfil.com':      perfilConfig,
        'weekend.perfil.com':      perfilConfig,
        'supercampo.perfil.com':   perfilConfig,
        'look.perfil.com':         perfilConfig,
        'luz.perfil.com':          perfilConfig,
        'mia.perfil.com':          perfilConfig,
        'lunateen.perfil.com':     perfilConfig,
        'horizonte.perfil.com':    perfilConfig,
        'exitoina.perfil.com':     perfilConfig,
        'brasil.perfil.com':       perfilConfig,
        'marieclaire.perfil.com':  perfilConfig,
        'radio.perfil.com':        perfilConfig,
        'rouge.perfil.com':        perfilConfig,
        'hombre.perfil.com':       perfilConfig,
        'canalnet.tv':             perfilConfig,
        'www.canalnet.tv':         perfilConfig,
        'batimes.com.ar':          perfilConfig,
        'www.batimes.com.ar':      perfilConfig,

        // ── El Ciudadano ──────────────────────────────────────────
        'www.elciudadanoweb.com': elciudadanoConfig,
        'elciudadanoweb.com':     elciudadanoConfig,

        // ── VíaPaís ───────────────────────────────────────────────
        'viapais.com.ar':     viapaisConfig,
        'www.viapais.com.ar': viapaisConfig,

        // ── Diario Popular ────────────────────────────────────────
        'www.diariopopular.com.ar': diariopopularConfig,
        'diariopopular.com.ar':     diariopopularConfig,

        // ── El Trece TV ───────────────────────────────────────────
        'www.eltrecetv.com.ar': eltrecetvConfig,
        'eltrecetv.com.ar':     eltrecetvConfig,

        // ── Radio Mitre / CienRadios ──────────────────────────────
        'www.radiomitre.com.ar':      cienradiosConfig,
        'radiomitre.com.ar':          cienradiosConfig,
        'ar.cienradios.com':          cienradiosConfig,
        'radiomitre.cienradios.com':  cienradiosConfig,
        'la100.cienradios.com':       cienradiosConfig,
        'mia.cienradios.com':         cienradiosConfig,
        'cienradios.com':             cienradiosConfig,
        'www.cienradios.com':         cienradiosConfig,

        // ── TyC Sports ────────────────────────────────────────────
        'www.tycsports.com': tycsportsConfig,
        'tycsports.com':     tycsportsConfig,

        // ── Ciudad Magazine ───────────────────────────────────────
        'www.ciudad.com.ar': ciudadConfig,
        'ciudad.com.ar':     ciudadConfig,

        // ── TN ────────────────────────────────────────────────────
        'www.tn.com.ar': tnConfig,
        'tn.com.ar':     tnConfig,

        // ── Minuto Uno ────────────────────────────────────────────
        'www.minutouno.com': minutounoConfig,
        'minutouno.com':     minutounoConfig,

        // ── Letra P ───────────────────────────────────────────────
        'www.letrap.com.ar': letrapConfig,
        'letrap.com.ar':     letrapConfig,

        // ── MDZ Online ────────────────────────────────────────────
        'www.mdzol.com': mdzConfig,
        'mdzol.com':     mdzConfig,

        // ── Los Andes ─────────────────────────────────────────────
        'www.losandes.com.ar': losandesConfig,
        'losandes.com.ar':     losandesConfig,

        // ── El Día ────────────────────────────────────────────────
        'www.eldia.com': eldiaConfig,
        'eldia.com':     eldiaConfig,

        // ── Río Negro ─────────────────────────────────────────────
        'www.rionegro.com.ar': rionegroConfig,
        'rionegro.com.ar':     rionegroConfig,

        // ── Diario Uno ────────────────────────────────────────────
        'www.diariouno.com.ar': diariounoConfig,
        'diariouno.com.ar':     diariounoConfig,

        // ── El Once ───────────────────────────────────────────────
        'www.elonce.com': elonceConfig,
        'elonce.com':     elonceConfig,

        // ── Aire de Santa Fe ──────────────────────────────────────
        'www.airedesantafe.com.ar': airedesantafeConfig,
        'airedesantafe.com.ar':     airedesantafeConfig,

        // ── Cadena 3 ───────────────────────────────────────────────
        'www.cadena3.com': cadena3Config,
        'cadena3.com':     cadena3Config

    };
})();
window.SITE_CSS_MAP = SITE_CSS_MAP;
