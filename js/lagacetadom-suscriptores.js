/**
 * lagacetadom-suscriptores.js — Mundo MAIN, www.lagaceta.com.ar
 *
 * El HTML de la nota llega completo porque rules.json falsea el User-Agent a Googlebot. El muro
 * lo arma después el sitio, en el cliente: controller.min.js (cargado con `defer`) hace un XHR a
 * /ajax/getInfo y, si la respuesta trae `viewContent`, pisa #articleContent con el teaser y el
 * muro. Interceptar esa respuesta es lo que sostiene la nota: Zonda y Wyleex ya los bloquean las
 * reglas de red de sw.js.
 *
 * POR QUÉ los hooks se instalan de forma síncrona y no detrás de `iniciarSiHabilitado()`: el flag
 * se lee del dataset que escribe loader.js, y eso depende de un getConfig() async. En Firefox
 * para Android esa lectura puede tardar más que parsear la página entera —más todavía con la nota
 * y el controller en caché—, y si el controller hace `new XMLHttpRequest` antes de que exista el
 * wrapper, cae el muro. Pasaba de forma intermitente. Mismo criterio que
 * lacapitaldom-suscriptores.js: sembramos siempre (envolver es inocuo) y la decisión del flag se
 * toma dentro del hook, que sí puede esperar.
 *
 * Lo que tolera llegar tarde (`paywallConfig`, `article_data`, el sidebar) sigue detrás de
 * `iniciarSiHabilitado()`: definirInterceptador() ya cubre la propiedad asignada de antemano.
 */

// Suscriptores - Cuánto esperamos el flag antes de darlo por habilitado. `true` es el default de
// storage y es el mismo criterio de iniciarSiHabilitado() cuando se le acaban los reintentos.
// Acota además cuánto puede quedar retenida la respuesta de getInfo si loader.js nunca responde.
const ESPERA_MAXIMA_FLAG_MS = 3000;

// Suscriptores - Llama a `accion(habilitado)` apenas se conoce el flag: en el acto si loader.js
// ya lo escribió en el dataset; si no, cuando llega `dl:configReady` o vence la espera.
function cuandoSeConozcaElFlag(accion) {
    const leerFlag = () => document.documentElement.dataset.dlSuscriptores;

    if (leerFlag() !== undefined) {
        accion(leerFlag() !== 'false');
        return;
    }

    let resuelto = false;
    const resolver = () => {
        if (resuelto) return;
        resuelto = true;
        accion(leerFlag() !== 'false');
    };
    document.addEventListener('dl:configReady', resolver, { once: true });
    setTimeout(resolver, ESPERA_MAXIMA_FLAG_MS);
}

// Suscriptores - Verifica si la feature está habilitada en la config del usuario.
// loader.js (mundo ISOLATED) setea este atributo en document.documentElement.
// Si no está disponible aún (storage async), reintenta una vez con 150ms de demora.
let _iniciadoLagaceta = false;

function iniciarSiHabilitado(reintentos) {
    if (_iniciadoLagaceta) return;
    const val = document.documentElement.dataset.dlSuscriptores;
    if (val === 'false') return; // Feature deshabilitada por el usuario
    if (val === undefined && reintentos > 0) {
        setTimeout(() => iniciarSiHabilitado(reintentos - 1), 150);
        return;
    }
    _iniciadoLagaceta = true;
    iniciar();
}

/**
 * Utilitario seguro para definir getters/setters en `window` sin provocar
 * `TypeError: Cannot redefine property` si la propiedad ya fue congelada/definida.
 */
function definirInterceptador(prop, transformFn) {
    let internalVal = window[prop];

    const desc = Object.getOwnPropertyDescriptor(window, prop);
    if (desc && !desc.configurable) {
        if (window[prop]) transformFn(window[prop]);
        return;
    }

    try {
        Object.defineProperty(window, prop, {
            set: function (val) {
                if (val) transformFn(val);
                internalVal = val;
            },
            get: function () {
                return internalVal;
            },
            configurable: true
        });
        // Si la propiedad ya tenía valor cuando instalamos el interceptador,
        // el setter nunca se va a disparar. Llamamos transformFn ahora.
        if (internalVal) transformFn(internalVal);
    } catch (e) {
        console.warn(`No se pudo definir interceptador para ${prop}:`, e);
        if (window[prop]) transformFn(window[prop]);
    }
}

// ── Hooks síncronos ─────────────────────────────────────────────────────────
// Se instalan apenas carga el script, antes que cualquier código del sitio. Ver la cabecera.

// Suscriptores (La Gaceta) - Intercepta el primer <script type="application/ld+json"> y
// modifica su contenido. No es código que se ejecute: el nodo se captura al insertarse y la
// modificación puede esperar al flag.
const ldJsonObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeName === 'SCRIPT' && node.type === 'application/ld+json') {
                cuandoSeConozcaElFlag((habilitado) => {
                    if (!habilitado) return;
                    try {
                        const data = JSON.parse(node.textContent);
                        const graph = data['@graph'] || [];
                        const article = graph.find(item => item['@type'] === 'NewsArticle');
                        if (article) {
                            console.log("ld+json interceptado!");
                            article.isPartOf.name = "Acceso Digital Medido";
                            article.isPartOf.productID = "lagaceta.com.ar:suscripcion_digital_metered";
                            node.textContent = JSON.stringify(data);
                        }
                    } catch (e) {
                        console.warn("Error al parsear ld+json:", e);
                    }
                });
                ldJsonObserver.disconnect();
                return;
            }
        }
    }
});
ldJsonObserver.observe(document.documentElement, { childList: true, subtree: true });

// Suscriptores (La Gaceta) - Intercepta el script de dataLayer (Google Tag Manager). Este SÍ se
// ejecuta: si el flag no llegó cuando se inserta, la modificación llega tarde y no tiene efecto.
// Se acepta porque sólo corrige lo que se reporta a GTM; el muro no depende de esto.
const dataLayerObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeName === 'SCRIPT') {
                try {
                    if (node.textContent.includes("dataLayer.push(") && node.textContent.includes("'access_level': 'hard'")) {
                        dataLayerObserver.disconnect();
                        cuandoSeConozcaElFlag((habilitado) => {
                            if (!habilitado) return;
                            console.log("Script con dataLayer interceptado!");
                            node.textContent = node.textContent.replace("'access_level': 'hard'", "'access_level': 'metered'");
                            node.textContent = node.textContent.replace("'perfil': 'premium'", "'perfil': 'noticia medida'");
                        });
                    }
                } catch (e) {
                    console.warn("Error al parsear dataLayer:", e);
                }
                return;
            }
        }
    }
});
dataLayerObserver.observe(document.documentElement, { childList: true, subtree: true });

// Suscriptores (La Gaceta) - Intercepta la inserción del elemento <article> con clase "premium"
const classPremiumObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeName === 'ARTICLE' && node.classList.contains('premium')) {
                cuandoSeConozcaElFlag((habilitado) => {
                    if (!habilitado) return;
                    console.log("Artículo premium interceptado!");
                    node.classList.remove('premium');
                });
                classPremiumObserver.disconnect();
                return;
            }
        }
    }
});
classPremiumObserver.observe(document.documentElement, { childList: true, subtree: true });

// Suscriptores (La Gaceta) - Intercepta XMLHttpRequest para /ajax/getInfo, que es lo que arma el
// muro. El controller asigna `onload` DESPUÉS de `send()`: lo retenemos en la instancia para
// entregárselo recién cuando se conoce el flag. Si ya se conoce —el caso común—, la entrega es en
// el acto y el sitio no nota la diferencia.
const _XHR = window.XMLHttpRequest;
window.XMLHttpRequest = function () {
    const xhr = new _XHR();
    const _open = xhr.open.bind(xhr);
    const _send = xhr.send.bind(xhr);
    const _addEventListener = xhr.addEventListener.bind(xhr);

    let _url = '';
    let _modified = false;
    let _retenido = false;

    const modificarRespuesta = () => {
        if (_modified) return;
        try {
            const data = JSON.parse(xhr.responseText);
            _modified = true;
            console.log("XHR a getInfo interceptado!", _url);
            data.article_access = "2"
            data.is_selected = false;
            data.is_subscriber = true;
            data.show_wall = false;
            data.viewContent = "";
            const json = JSON.stringify(data);
            Object.defineProperty(xhr, 'responseText', {
                get: () => json,
                configurable: true
            });
            Object.defineProperty(xhr, 'response', {
                get: () => json,
                configurable: true
            });
        } catch (e) {
            console.warn("Error al modificar respuesta XHR:", e);
        }
    };

    const retenerOnload = () => {
        if (_retenido) return;
        _retenido = true;

        // Si alguien ya había asignado `onload`, lo sacamos del handler nativo antes de taparlo:
        // si no, dispararía por su cuenta con la respuesta sin modificar.
        let onloadDelSitio = xhr.onload;
        xhr.onload = null;

        Object.defineProperty(xhr, 'onload', {
            get: () => onloadDelSitio,
            set: (fn) => { onloadDelSitio = fn; },
            configurable: true
        });

        _addEventListener('load', (evento) => {
            cuandoSeConozcaElFlag((habilitado) => {
                if (habilitado) modificarRespuesta();
                if (typeof onloadDelSitio === 'function') onloadDelSitio.call(xhr, evento);
            });
        });
    };

    xhr.open = function (method, url, ...rest) {
        _url = url;
        if (String(url).includes('/ajax/getInfo')) retenerOnload();
        return _open(method, url, ...rest);
    };

    xhr.send = function (...args) {
        return _send(...args);
    };

    return xhr;
};

// ── Hooks que toleran llegar tarde ──────────────────────────────────────────

function iniciar() {
    (function () {

        // Suscriptores (La Gaceta) - Intercepta `paywallConfig`
        definirInterceptador('paywallConfig', (val) => {
            if (val.type) {
                console.log("paywallConfig interceptado!", val);
                val.type = "metered";
            }
        });

        // Suscriptores (La Gaceta) - Intercepta `article_data`
        definirInterceptador('article_data', (val) => {
            if (val.access) {
                console.log("article_data interceptado!", val);
                val.access = "metered";
            }
        });

        // Suscriptores (La Gaceta) - Muestra el sidebar que el sitio oculta en artículos premium
        window.addEventListener('load', () => {
            const sidebar = document.getElementById("sidebar");
            if (sidebar) {
                console.log("Sidebar mostrado!");
                document.getElementById("sidebar").style.display = "block";
            } else {
                console.warn("No se encontró el sidebar para mostrarlo.");
            }
        });

    })();
}
// Escucha el evento que dispara loader.js (mundo ISOLATED) cuando la config
// ya fue escrita en el dataset. Elimina la race condition contra getConfig() async.
document.addEventListener('dl:configReady', () => iniciarSiHabilitado(0), { once: true });

// Fallback: si el evento se disparó antes de que este listener se registrara
// (improbable en document_start, pero defensivo), reintentamos con polling corto.
iniciarSiHabilitado(1);
