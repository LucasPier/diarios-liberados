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
 *  5. Abrir la página de la extensión para comprobar si hay una versión nueva.
 *  6. Detectar host permissions no otorgados y ofrecer pedirlos.
 *  7. Avisar el límite de La Nación cuando hay una pestaña de ese medio abierta.
 */

// Página de presentación de la extensión (GitHub Pages)
const URL_LANDING = 'https://lucaspier.github.io/diarios-liberados/';

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
    "unosantafe.com.ar", "unoentrerios.com.ar", "elonce.com", "airedesantafe.com.ar",
    "cadena3.com", "rosarioplus.com", "somosohlala.com", "rollingstone.com"
];

// Dominios donde aplica el aviso del límite de La Nación.
//
// Va SÓLO lanacion.com.ar y no los otros dos del grupo (somosohlala.com y rollingstone.com):
// las notas para suscriptores aparecen únicamente ahí, así que avisar en los otros sería alarmar
// por una limitación que en esos sitios no existe.
//
// Es un subconjunto de DOMINIOS_CUBIERTOS y no se deriva de ahí a propósito: son dos criterios
// distintos (qué recargar vs. dónde avisar) que no tienen por qué moverse juntos.
const DOMINIOS_LANACION = ["lanacion.com.ar"];

/**
 * Devuelve la versión instalada leyéndola del manifest.
 * Es la única fuente de verdad: no se repite el número en ningún otro lado.
 * @returns {string|null}
 */
function obtenerVersionExtension() {
    try {
        return chrome.runtime.getManifest().version;
    } catch {
        return null;
    }
}

// ── Permisos de host ────────────────────────────────────────────────────────
//
// EL PROBLEMA (Firefox)
// En MV3 los host permissions se otorgan al instalar, pero el usuario puede revocarlos cuando
// quiera desde about:addons, y los que se AGREGAN en una actualización no se otorgan solos
// (bug 1893232 de Mozilla, todavía abierto). O sea: cada vez que sumamos un diario nuevo, quien
// ya tenía la extensión no lo ve funcionar. Y cuando falta el permiso no hay ningún error: los
// content scripts simplemente no se inyectan y las reglas modifyHeaders se ignoran en silencio.
//
// En Chrome esto casi nunca se dispara, porque los permisos declarados se conceden al instalar.
// Si no falta ninguno el banner no se muestra, así que el popup queda igual que siempre.
//
// La lista sale de host_permissions del manifest y no de una constante nueva: DOMINIOS_CUBIERTOS
// ya duplica dominios y no hace falta una tercera lista que se desincronice.

// ── Banners colapsables ─────────────────────────────────────────────────────
//
// Los tres avisos del popup (permisos, límite de La Nación y recarga) comparten la misma mecánica:
// un wrapper que anima su altura con grid-template-rows de 0fr a 1fr.
//
// La clase .visible sola NO alcanza para ocultarlos. Un wrapper colapsado sigue siendo una caja en
// el layout: mide 0 de alto pero ocupa su lugar, y apilados dejan un hueco vacío arriba de los
// toggles. Por eso el estado "no corresponde mostrarlo" es [hidden] —que el CSS del popup fuerza a
// display:none— y la clase queda sólo para la animación.

/**
 * Muestra u oculta un banner colapsable.
 * @param {HTMLElement|null} wrapper
 * @param {boolean} mostrar
 */
function alternarBanner(wrapper, mostrar) {
    if (!wrapper) return;

    if (!mostrar) {
        // Se oculta de una, sin animación de salida: con display:none no hay transición posible, y
        // encadenarla a transitionend deja el hueco de vuelta si el evento no llega (por ejemplo
        // con prefers-reduced-motion).
        wrapper.classList.remove('visible');
        wrapper.hidden = true;
        return;
    }

    wrapper.hidden = false;

    // La clase va un frame después: si se saca hidden y se agrega .visible en el mismo tick, el
    // navegador computa un solo estilo y el banner aparece de golpe, sin transición.
    requestAnimationFrame(() => wrapper.classList.add('visible'));
}

/** Orígenes pendientes de otorgar. Se calcula al abrir el popup. */
let origenesFaltantes = [];

/**
 * Chequea uno por uno los orígenes declarados en el manifest.
 * De a uno y no todos juntos porque permissions.contains() con varios orígenes devuelve un único
 * booleano: diría que falta algo sin decir qué, y el pedido terminaría incluyendo los ya otorgados.
 * @returns {Promise<string[]>}
 */
async function calcularOrigenesFaltantes() {
    if (!chrome.permissions) return [];

    let declarados;
    try {
        declarados = chrome.runtime.getManifest().host_permissions || [];
    } catch {
        return [];
    }

    const resultados = await Promise.all(declarados.map(async (origen) => {
        try {
            return await chrome.permissions.contains({ origins: [origen] }) ? null : origen;
        } catch {
            // Origen que este navegador no sabe evaluar: no lo reportamos como faltante para no
            // mostrar un banner que el usuario no puede resolver.
            return null;
        }
    }));

    return resultados.filter(Boolean);
}

/** Muestra u oculta el banner de permisos según lo que falte. */
async function actualizarBannerPermisos() {
    const wrapper = document.getElementById('permisos-banner-wrapper');
    const textSpan = document.getElementById('permisos-banner-text');
    if (!wrapper || !textSpan) return;

    origenesFaltantes = await calcularOrigenesFaltantes();

    if (origenesFaltantes.length === 0) {
        alternarBanner(wrapper, false);
        return;
    }

    textSpan.textContent = origenesFaltantes.length === 1
        ? 'Falta el permiso de un sitio: ahí la extensión no se activa'
        : `Faltan los permisos de ${origenesFaltantes.length} sitios: ahí la extensión no se activa`;
    alternarBanner(wrapper, true);
}

/**
 * Verifica si una URL cae bajo alguno de los dominios de la lista, contando los subdominios.
 * @param {string} url
 * @param {string[]} dominios
 * @returns {boolean}
 */
function coincideConDominios(url, dominios) {
    try {
        const hostname = new URL(url).hostname;
        return dominios.some(d => hostname === d || hostname.endsWith('.' + d));
    } catch {
        return false;
    }
}

/** Verifica si una URL pertenece a alguno de los dominios cubiertos */
function esDominioCubierto(url) {
    return coincideConDominios(url, DOMINIOS_CUBIERTOS);
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
        alternarBanner(wrapper, false);
    } else {
        if (totalTabs === 1) {
            textSpan.textContent = 'Recargá la página para aplicar los cambios';
        } else {
            textSpan.textContent = 'Recargá las páginas para aplicar los cambios';
        }
        alternarBanner(wrapper, true);
    }
}

// ── Límite de La Nación ─────────────────────────────────────────────────────
//
// Es el único medio soportado en el que la feature de suscriptores NO abre las notas exclusivas.
// Sí se desbloquean los resúmenes con IA y la escucha de notas, así que el aviso aclara las dos
// cosas: sin eso, el usuario asume que la extensión está rota justo en el diario más leído del país.
//
// El texto es fijo y vive en popup.html; acá sólo se decide si se muestra. No depende del toggle
// de suscriptores: es información sobre el alcance real en ese medio, esté la feature prendida o no.

/** Muestra el aviso del límite de La Nación si hay alguna pestaña del medio abierta. */
async function actualizarBannerLimiteLanacion() {
    const wrapper = document.getElementById('limite-banner-wrapper');
    if (!wrapper) return;

    let hayTabDeLanacion = false;
    try {
        const tabs = await chrome.tabs.query({});
        hayTabDeLanacion = tabs.some(tab => tab.url && coincideConDominios(tab.url, DOMINIOS_LANACION));
    } catch {
        // Sin acceso a las tabs no se puede saber qué hay abierto: mejor no avisar nada que avisar
        // de un medio que el usuario no está leyendo.
        hayTabDeLanacion = false;
    }

    alternarBanner(wrapper, hayTabDeLanacion);
}

// Los links del popup se abren en una pestaña del navegador, no dentro del popup.
//
// En escritorio, target="_blank" ya hace eso. Pero en Firefox para Android el popup es una vista
// embebida dentro de la app: la navegación ocurre ADENTRO del panel y el usuario queda atrapado
// en un navegador sin barra de direcciones ni forma de volver. tabs.create() se comporta igual en
// las dos plataformas, así que no hace falta preguntar en cuál estamos.
document.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a[href^="http"]');
    if (!enlace) return;

    evento.preventDefault();
    chrome.tabs.create({ url: enlace.href });
    window.close();
});

document.addEventListener('DOMContentLoaded', async () => {

    // ── Versión ──────────────────────────────────────────────────────────────
    const version = obtenerVersionExtension();

    const versionElement = document.getElementById('extension-version');
    if (versionElement) {
        versionElement.textContent = version ? `v${version}` : '';
        versionElement.hidden = !version;
    }

    // ── Buscar actualizaciones ───────────────────────────────────────────────
    // Se delega la comparación a la página de la extensión, que conoce la
    // última versión publicada. Se le pasa la instalada por query string.
    const btnBuscarUpdate = document.getElementById('btn-check-update');
    if (btnBuscarUpdate) {
        btnBuscarUpdate.addEventListener('click', () => {
            const url = version
                ? `${URL_LANDING}?version=${encodeURIComponent(version)}`
                : URL_LANDING;
            chrome.tabs.create({ url });
            window.close();
        });
    }

    // ── Permisos faltantes ───────────────────────────────────────────────────
    const btnPermisos = document.getElementById('btn-permisos');
    if (btnPermisos) {
        btnPermisos.addEventListener('click', () => {
            if (!origenesFaltantes.length) return;

            // request() sale de forma SÍNCRONA desde el click: si se interpone un await, el
            // navegador ya no lo considera respuesta a un gesto del usuario y descarta el pedido.
            // Por eso origenesFaltantes se calcula al abrir el popup y no acá.
            chrome.permissions.request({ origins: origenesFaltantes })
                .catch(() => { /* el usuario canceló o el navegador rechazó el pedido */ });

            // Firefox ancla su diálogo de permisos al mismo botón de la barra del que cuelga este
            // popup, así que uno tapa al otro. Cerramos para despejarlo.
            //
            // No se espera la respuesta del pedido: al cerrar, este documento deja de existir y no
            // habría a quién avisarle. Tampoco hace falta, porque el banner se recalcula solo la
            // próxima vez que se abra el popup.
            window.close();
        });
    }

    actualizarBannerPermisos();

    // ── Límite de La Nación ──────────────────────────────────────────────────
    actualizarBannerLimiteLanacion();

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
        alternarBanner(document.getElementById('reload-banner-wrapper'), false);
    });

    // ── Verificar al abrir si ya hay tabs cubiertas ──────────────────────────
    // El banner se activa únicamente al modificar un toggle.
});
