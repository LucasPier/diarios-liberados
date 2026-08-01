// Suscriptores - Verifica si la feature está habilitada en la config del usuario.
// loader.js (mundo ISOLATED) setea este atributo en document.documentElement.
// Si no está disponible aún (storage async), reintenta una vez con 150ms de demora.
let _iniciadoPagina12Dom = false;

function iniciarSiHabilitado(reintentos) {
    if (_iniciadoPagina12Dom) return;
    const val = document.documentElement.dataset.dlSuscriptores;
    if (val === 'false') return; // Feature deshabilitada por el usuario
    if (val === undefined && reintentos > 0) {
        setTimeout(() => iniciarSiHabilitado(reintentos - 1), 150);
        return;
    }
    _iniciadoPagina12Dom = true;
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
        // Suscriptores - Intenta leer las URLs directamente del dataset síncrono o via postMessage
        let urlImagenSocios = document.documentElement.dataset.dlSociosUrl || '',
            urlImagenSocios2 = document.documentElement.dataset.dlSociosUrl2 || '';

        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "FROM_EXT") {
                urlImagenSocios = event.data.url || urlImagenSocios;
                urlImagenSocios2 = event.data.url2 || urlImagenSocios2;

                // Si el banner ya fue renderizado previamente con src vacía, le actualizamos la imagen
                const imgBanner = document.querySelector('.p12-partners-top-bar .svg-container img');
                if (imgBanner && urlImagenSocios) {
                    imgBanner.src = urlImagenSocios;
                }
            }
        });

        // Suscriptores - Inserta el banner "Exclusivo para SOCI@S" en el artículo.
        const agregarBanner = () => {
            // Asegurar que leemos la URL del dataset si aún no fue seteada por mensaje
            if (!urlImagenSocios) {
                urlImagenSocios = document.documentElement.dataset.dlSociosUrl || '';
            }

            const contenedor = document.querySelector("main>.article-wrapper");
            const hayBanner = contenedor && contenedor.querySelector('.p12-partners-top-bar .svg-container') !== null;
            if (!hayBanner && contenedor != null) {

                const banner = document.createElement("div");
                banner.innerHTML = `<div class="p12-partners-top-bar " style="background-image: url(&quot;/pf/resources/p12/Partners-Top-Bar/Fondo.jpg?d=91&quot;);"><div class="p12-partners-top-bar--inner"><div class="left-col"><span class="text social-text">Exclusivo para</span><div class="svg-container"><img src="${urlImagenSocios}" width="90" height="22" alt="SOCI@S"></div></div></div></div>`;
                contenedor.insertBefore(banner, contenedor.children[0]);

                const verificarNode = (node) => {
                    if (typeof node === "object" && node.querySelector && node.querySelector('main>.article-wrapper>div>.p12-partners-top-bar .svg-container')) {
                        observer.disconnect();
                        agregarBanner();
                    }
                };

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.removedNodes.forEach((node) => {
                            verificarNode(node);
                        });
                        mutation.addedNodes.forEach((node) => {
                            verificarNode(node);
                        });
                    });
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

            } else if (contenedor == null) {
                setTimeout(agregarBanner, 100);
            }
        };

        // Suscriptores - Intercepta la asignación del objeto global `Fusion`
        definirInterceptador('Fusion', (val) => {
            if (val && val.globalContent && val.globalContent.content_restrictions) {
                val.globalContent.content_restrictions = undefined;
                agregarBanner();
            }
        });

    })();
}
iniciarSiHabilitado(1);
