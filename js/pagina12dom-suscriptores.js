(function () {
    let _fusionData = undefined;

    // Suscriptores - Recibe las URLs de los SVG enviadas desde pagina12-suscriptores.js (contexto ISOLATED)
    // via postMessage, necesario porque en world MAIN no se puede acceder a chrome.runtime.getURL
    let urlImagenSocios = '',
        urlImagenSocios2 = '';

    window.addEventListener("message", (event) => {
        if (event.data.type === "FROM_EXT") {
            urlImagenSocios = event.data.url;
            urlImagenSocios2 = event.data.url2;
        }
    });

    // Suscriptores - Inserta el banner "Exclusivo para SOCI@S" en el artículo.
    // Usa MutationObserver para re-insertarlo si el sitio lo elimina.
    const agregarBanner = () => {
        // console.log("Agregar banner");
        const contenedor = document.querySelector("main>.article-wrapper");
        const hayBanner = contenedor.querySelector('.p12-partners-top-bar .svg-container') !== null;
        if (!hayBanner && contenedor != null) {

            const banner = document.createElement("div");
            banner.innerHTML = `<div class="p12-partners-top-bar " style="background-image: url(&quot;/pf/resources/p12/Partners-Top-Bar/Fondo.jpg?d=91&quot;);"><div class="p12-partners-top-bar--inner"><div class="left-col"><span class="text social-text">Exclusivo para</span><div class="svg-container"><img src="${urlImagenSocios}" width="90" height="22" alt="SOCI@S"></div></div></div></div>`;
            contenedor.insertBefore(banner, contenedor.children[0]),
            verificarNode = (node)=>{
                if (typeof node === "object" && node.querySelector && node.querySelector('main>.article-wrapper>div>.p12-partners-top-bar .svg-container')) {
                    observer.disconnect();
                    agregarBanner();
                }
            };

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // Revisamos cada nodo que fue eliminado o agregado en esta mutación
                    mutation.removedNodes.forEach((node) => {
                        // Verificamos si es el banner
                        verificarNode(node);
                    });
                    mutation.addedNodes.forEach((node) => {
                        // Verificamos si es el banner
                        verificarNode(node);
                    });
                });
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

        } else if (contenedor == null) {
            // console.log("Sin contenedor banner");
            setTimeout(agregarBanner, 100);
        }
    };

    // Suscriptores - Intercepta la asignación del objeto global `Fusion` (framework Arc Publishing de P12)
    // antes de que el sitio lo lea. Elimina content_restrictions para desbloquear el artículo
    // y dispara el banner de socios.
    Object.defineProperty(window, 'Fusion', {
        set: function (val) {
            if (val && val.globalContent && val.globalContent.content_restrictions) {
                // console.log("¡Fusion interceptado!", val);
                val.globalContent.content_restrictions = undefined;
                agregarBanner();
            }

            _fusionData = val;
        },
        get: function () {
            return _fusionData;
        },
        configurable: true
    });



})();
