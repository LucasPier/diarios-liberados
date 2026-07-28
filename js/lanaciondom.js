(function () {
    let _fusionData = undefined;

    /*let urlImagenSocios = '',
        urlImagenSocios2 = '';

    window.addEventListener("message", (event) => {
        if (event.data.type === "FROM_EXT") {
            urlImagenSocios = event.data.url;
            urlImagenSocios2 = event.data.url2;
        }
    });

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
                        // if (typeof node === "object" && node.querySelector && node.querySelector('main>.article-wrapper>div>.p12-partners-top-bar .svg-container')) {
                        //     observer.disconnect();
                        //     agregarBanner();
                        // }
                        verificarNode(node);
                    });
                    mutation.addedNodes.forEach((node) => {
                        // Verificamos si es el banner
                        // if (typeof node === "object" && node.querySelector && node.querySelector('main>.article-wrapper>div>.p12-partners-top-bar .svg-container')) {
                        //     observer.disconnect();
                        //     agregarBanner();
                        // }
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
    };*/
    console.log("¡Fusion iniciado!");

    // Suscriptores - Intercepta la asignación del objeto global `Fusion` (framework de La Nación)
    // antes de que el sitio lo lea. Al poner IS_DEV=true y API_ENV="dev" se fuerza el modo
    // desarrollo, que omite las validaciones de paywall en el front-end.
    Object.defineProperty(window, 'Fusion', {
        set: function (val) {
            /*if (val && val.environment) {
                console.log("¡Fusion hola!", val);
            }*/
            if (val && val.environment && typeof val.environment.IS_DEV !== "undefined") {
                console.log("¡Fusion interceptado!", val);
                val.environment.IS_DEV = true;
                val.environment.API_ENV = "dev";
                // agregarBanner();
            }

            _fusionData = val;
        },
        get: function () {
            return _fusionData;
        },
        configurable: true
    });



})();