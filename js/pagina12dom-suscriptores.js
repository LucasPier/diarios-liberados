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
        // Si la propiedad ya tenía valor cuando instalamos el interceptador,
        // el setter nunca se va a disparar. Llamamos transformFn ahora.
        if (internalVal) transformFn(internalVal);
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
            // Sólo mensajes de esta misma ventana. Este script vive en el mundo MAIN, así que
            // cualquier script del sitio puede emitir un postMessage con este mismo type y
            // hacernos usar la URL que quiera.
            if (event.source !== window) return;
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

                // El banner se arma nodo por nodo y no con innerHTML: urlImagenSocios puede llegar
                // por postMessage, y en el mundo MAIN cualquier script del sitio puede mandar uno.
                // Interpolarla en una plantilla de HTML era una inyección esperando ocurrir.
                const banner = document.createElement("div");

                const barra = document.createElement("div");
                barra.className = "p12-partners-top-bar";
                barra.style.backgroundImage = 'url("/pf/resources/p12/Partners-Top-Bar/Fondo.jpg?d=91")';

                const interior = document.createElement("div");
                interior.className = "p12-partners-top-bar--inner";

                const columna = document.createElement("div");
                columna.className = "left-col";

                const leyenda = document.createElement("span");
                leyenda.className = "text social-text";
                leyenda.textContent = "Exclusivo para";

                const contenedorSvg = document.createElement("div");
                contenedorSvg.className = "svg-container";

                const imagen = document.createElement("img");
                imagen.src = urlImagenSocios;
                imagen.width = 90;
                imagen.height = 22;
                imagen.alt = "SOCI@S";

                contenedorSvg.appendChild(imagen);
                columna.appendChild(leyenda);
                columna.appendChild(contenedorSvg);
                interior.appendChild(columna);
                barra.appendChild(interior);
                banner.appendChild(barra);

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
// Escucha el evento que dispara loader.js (mundo ISOLATED) cuando la config
// ya fue escrita en el dataset. Elimina la race condition contra getConfig() async.
document.addEventListener('dl:configReady', () => iniciarSiHabilitado(0), { once: true });

// Fallback: si el evento se disparó antes de que este listener se registrara
// (improbable en document_start, pero defensivo), reintentamos con polling corto.
iniciarSiHabilitado(1);