/**
 * analytics.js — Medición de uso de la landing (Google Analytics 4)
 *
 * Vive en un archivo propio y no como <script> pegado en el HTML porque el ID
 * de medición, la guarda de entorno y la normalización de la URL son decisiones
 * que se entienden leyéndolas juntas.
 *
 * Cuatro cosas que hay que saber antes de tocar esto:
 *
 * 1. LOS NÚMEROS SON UN PISO, NO UN TOTAL. El público de esta extensión es,
 *    por definición, el que instala bloqueadores: googletagmanager.com no
 *    carga para una parte importante de las visitas. Y el sesgo no es
 *    aleatorio — se pierde justamente al usuario más técnico, que es el que
 *    más instala. Las tendencias relativas sirven; los absolutos, no.
 *
 * 2. NADA DE LA LANDING PUEDE DEPENDER DE ESTO. `gtag()` queda definida acá
 *    antes de pedir el script remoto, así que toda llamada posterior es
 *    inofensiva aunque el bloqueador haya matado la descarga: encola en un
 *    dataLayer que nadie va a leer y sigue de largo. Además, quien mide desde
 *    landing.js lo hace con `window.dlAnalytics?.evento(...)`.
 *
 * 3. EL ?version= DEL POPUP NO ES UNA PÁGINA DISTINTA. El popup abre la
 *    landing con ?version=X.Y.Z, así que sin normalizar habría en GA4 tantas
 *    páginas como versiones publicadas y el informe quedaría partido en
 *    pedazos. Se manda `page_location` sin query y la versión viaja aparte,
 *    como propiedad del usuario.
 *
 * 4. ESTO NO PUEDE ENTRAR EN LA EXTENSIÓN. La medición vive sólo en la
 *    landing, que es una web común. Cargar un script remoto dentro de la
 *    extensión lo prohíbe MV3 en Chrome y lo rechaza la revisión de AMO en
 *    Firefox.
 */

/** ID de medición del flujo de datos web de GA4 (formato G-XXXXXXXXXX). */
const ID_MEDICION = 'G-Q0Z4014PDB';

/**
 * Hosts donde la medición está activa. En cualquier otro (Live Server, file://,
 * un fork de otra persona) no se manda un solo hit: se loguea por consola lo
 * que se hubiera mandado, que para desarrollar alcanza y sobra.
 */
const HOSTS_MEDIDOS = ['lucaspier.github.io'];

/**
 * Endpoint propio al que redirigir los hits, para el día que exista un dominio
 * propio con un proxy adelante (Cloudflare Worker o equivalente).
 *
 * Mientras sea `null`, gtag manda a google-analytics.com y los bloqueadores se
 * comen su parte. Un proxy sólo sirve si es del MISMO dominio que la página:
 * con lucaspier.github.io no se puede, porque el DNS de github.io no es
 * nuestro. Cuando haya dominio propio, esto es lo único que hay que cambiar.
 */
const URL_TRANSPORTE = null;

/** Query param que activa el modo diagnóstico contra la propiedad real. */
const PARAM_DEBUG = 'dl_debug';

/** Formato aceptado para una versión: entre 1 y 4 componentes numéricos. */
const RE_VERSION_GA = /^\d+(\.\d+){0,3}$/;

/**
 * ¿Hay que mandar hits de verdad?
 * @returns {boolean}
 */
function medicionHabilitada() {
    return HOSTS_MEDIDOS.includes(location.hostname)
        && ID_MEDICION.startsWith('G-')
        && !ID_MEDICION.includes('XXXX');
}

/**
 * ¿Se está diagnosticando? Hace que los eventos aparezcan en DebugView y, con
 * el filtro de tráfico de desarrollador activo en la propiedad, que además
 * queden fuera de los informes.
 * @returns {boolean}
 */
function enModoDebug() {
    return new URLSearchParams(location.search).has(PARAM_DEBUG);
}

/**
 * URL de la página sin query ni fragmento: una sola entrada en los informes,
 * en lugar de una por versión instalada y otra por cada ancla de la página.
 * @returns {string}
 */
function normalizarUbicacion() {
    return location.origin + location.pathname;
}

/**
 * Versión que el popup declara tener instalada, si vino y si es creíble.
 * @returns {string|null}
 */
function versionDelPopup() {
    const version = new URLSearchParams(location.search).get('version');
    return version && RE_VERSION_GA.test(version) ? version : null;
}

window.dataLayer = window.dataLayer || [];

/** Firma exacta que espera gtag.js: usa `arguments`, no puede ser una flecha. */
function gtag() {
    window.dataLayer.push(arguments);
}

/**
 * Registra un evento.
 *
 * Se expone en `window.dlAnalytics` y no como función suelta para que landing.js
 * pueda invocarla con `?.` y no le importe si este archivo cargó o no.
 *
 * @param {string} nombre — snake_case, en español, hasta 40 caracteres
 * @param {Object<string, string|number>} [parametros]
 */
function registrarEvento(nombre, parametros = {}) {
    if (!medicionHabilitada()) {
        console.log('[analytics] evento (no enviado):', nombre, parametros);
        return;
    }

    gtag('event', nombre, parametros);
}

/**
 * Deja identificado al visitante antes del primer page_view: así el informe
 * puede separar a quien ya tiene la extensión de quien llega de afuera, que es
 * la pregunta que motivó toda esta medición.
 *
 * SÓLO ESCRIBE CUANDO HAY VERSIÓN, y esto es lo importante: las propiedades de
 * usuario de GA4 son persistentes por cliente y gana la última escritura. Si
 * escribiéramos `no` en las visitas sin `?version=`, alcanzaría con que alguien
 * que instaló la extensión volviera una semana después desde un marcador para
 * que su propio historial pasara a decir que nunca la tuvo. El informe
 * terminaría contando como "no instalado" justo a quien sí instaló.
 *
 * La ausencia de la propiedad es la señal de "nunca llegó desde el popup": en
 * los informes aparece como `(not set)`. Y para saber si UNA visita puntual
 * vino del popup ya está el evento `estado_version`, que sólo se dispara
 * cuando hubo una versión con la que comparar.
 */
function declararPropiedadesDeUsuario() {
    const version = versionDelPopup();
    if (!version) return;

    gtag('set', 'user_properties', {
        tiene_extension: 'si',
        version_instalada: version
    });
}

function iniciar() {
    if (!medicionHabilitada()) {
        console.log('[analytics] medición apagada en', location.hostname);
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ID_MEDICION}`;
    document.head.appendChild(script);

    gtag('js', new Date());

    declararPropiedadesDeUsuario();

    const configuracion = {
        // El page_view automático de este config ya sale con la URL limpia.
        page_location: normalizarUbicacion()
    };

    if (URL_TRANSPORTE) {
        configuracion.server_container_url = URL_TRANSPORTE;
        configuracion.first_party_collection = true;
    }

    if (enModoDebug()) {
        // Alcanza con esto para las dos cosas: DebugView muestra los eventos
        // que lo traen, y el filtro «Tráfico de desarrollador» de GA4 —que se
        // activa en la propiedad, no acá— los excluye de los informes.
        //
        // NO agregar `traffic_type: 'internal'`: el filtro de tráfico interno
        // descarta los eventos ANTES de DebugView, así que marcar las dos
        // cosas deja la depuración a ciegas. Ya pasó una vez.
        configuracion.debug_mode = true;
    }

    gtag('config', ID_MEDICION, configuracion);
}

window.dlAnalytics = { evento: registrarEvento };

iniciar();
