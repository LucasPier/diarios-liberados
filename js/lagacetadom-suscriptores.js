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
    } catch (e) {
        console.warn(`No se pudo definir interceptador para ${prop}:`, e);
        if (window[prop]) transformFn(window[prop]);
    }
}

function iniciar() {
    (function () {

        // Suscriptores (La Gaceta) - Intercepta el primer <script type="application/ld+json"> y
        // modifica su contenido antes de que el sitio lo evalúe.
        const ldJsonObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeName === 'SCRIPT' && node.type === 'application/ld+json') {
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
                        ldJsonObserver.disconnect();
                        return;
                    }
                }
            }
        });
        ldJsonObserver.observe(document.documentElement, { childList: true, subtree: true });

        // Suscriptores (La Gaceta) - Intercepta el script de dataLayer (Google Tag Manager)
        const dataLayerObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeName === 'SCRIPT') {
                        try {
                            if (node.textContent.includes("dataLayer.push(") && node.textContent.includes("'access_level': 'hard'")) {
                                console.log("Script con dataLayer interceptado!");
                                node.textContent = node.textContent.replace("'access_level': 'hard'", "'access_level': 'metered'");
                                node.textContent = node.textContent.replace("'perfil': 'premium'", "'perfil': 'noticia medida'");
                                dataLayerObserver.disconnect();
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
                        try {
                            console.log("Artículo premium interceptado!");
                            node.classList.remove('premium');
                        } catch (e) {
                            console.warn("Error al parsear ld+json:", e);
                        }
                        classPremiumObserver.disconnect();
                        return;
                    }
                }
            }
        });
        classPremiumObserver.observe(document.documentElement, { childList: true, subtree: true });

        // Suscriptores (La Gaceta) - Intercepta XMLHttpRequest para /ajax/getInfo
        const _XHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function () {
            const xhr = new _XHR();
            const _open = xhr.open.bind(xhr);
            const _send = xhr.send.bind(xhr);
            const _addEventListener = xhr.addEventListener.bind(xhr);

            let _url = '';
            let _modified = false;

            const modificarRespuesta = () => {
                if (_modified) return;
                try {
                    const data = JSON.parse(xhr.responseText);
                    _modified = true;
                    console.log("Fetch a getInfo interceptado!", _url);
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

            xhr.open = function (method, url, ...rest) {
                _url = url;
                if (url.includes('/ajax/getInfo')) {
                    _addEventListener('readystatechange', function () {
                        if (xhr.readyState === 4) modificarRespuesta();
                    });
                }
                return _open(method, url, ...rest);
            };

            xhr.send = function (...args) {
                return _send(...args);
            };

            return xhr;
        };

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
iniciarSiHabilitado(1);
