(function () {

    // Interceptar el primer <script type="application/ld+json"> y modificar su contenido
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
                            // article.isAccessibleForFree = true;
                            // delete article.hasPart;
                            // delete article.isPartOf;
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

    // Interceptar dataLayer
    const dataLayerObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeName === 'SCRIPT') {
                    try {
                        if(node.textContent.includes("dataLayer.push(") && node.textContent.includes("'access_level': 'hard'")) {
                            console.log("Script con dataLayer interceptado!");

                            // Reemplazar 'access_level': 'hard' por 'access_level': 'metered'
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

    // Interceptar classPremium
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

    // Interceptar XMLHttpRequest
    const _XHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
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
                // data.is_logged = true;
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

        xhr.open = function(method, url, ...rest) {
            _url = url;
            // Registrar el listener acá, ANTES que los listeners del sitio,
            // para que la respuesta esté modificada cuando ellos la lean.
            if (url.includes('/ajax/getInfo')) {
                _addEventListener('readystatechange', function() {
                    if (xhr.readyState === 4) modificarRespuesta();
                });
            }
            return _open(method, url, ...rest);
        };

        xhr.send = function(...args) {
            return _send(...args);
        };

        return xhr;
    };

    let _paywallConfigData = undefined,
        _article_dataData = undefined;

    Object.defineProperty(window, 'paywallConfig', {
        set: function (val) {
            if (val && val.type) {
                console.log("paywallConfig interceptado!", val);
                val.type = "metered";
            }

            _paywallConfigData = val;
        },
        get: function () {
            return _paywallConfigData;
        },
        configurable: true
    });


    Object.defineProperty(window, 'article_data', {
        set: function (val) {
            if (val && val.access) {
                console.log("article_data interceptado!", val);
                val.access = "metered";
            }

            _article_dataData = val;
        },
        get: function () {
            return _article_dataData;
        },
        configurable: true
    });


    window.addEventListener('load', () => {
        
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            //sidebar.style.setProperty("display", "block", "important");
            console.log("Sidebar mostrado!");
            
            document.getElementById("sidebar").style.display = "block";
        } else {
            console.warn("No se encontró el sidebar para mostrarlo.");
        }
    });


})();