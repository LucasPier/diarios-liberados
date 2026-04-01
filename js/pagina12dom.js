(function () {
    let _fusionData = undefined;

    let urlImagenSocios = '',
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
            // console.log("Agregamos banner");

            const banner = document.createElement("div");
            banner.innerHTML = `<div class="p12-partners-top-bar " style="background-image: url(&quot;/pf/resources/p12/Partners-Top-Bar/Fondo.jpg?d=91&quot;);"><div class="p12-partners-top-bar--inner"><div class="left-col"><span class="text social-text">Exclusivo para</span><div class="svg-container"><img src="${urlImagenSocios}" width="90" height="22" alt="SOCI@S"></div></div></div></div>`;
            contenedor.insertBefore(banner, contenedor.children[0]);

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log("Mutation banner");
                    // Revisamos cada nodo que fue eliminado en esta mutación
                    mutation.removedNodes.forEach((node) => {
                        // Verificamos si es el banner
                        if (node.querySelector('main>.article-wrapper>div>.p12-partners-top-bar .svg-container')) {
                            console.log('¡Elemento detectado como eliminado!');
                            observer.disconnect();
                            agregarBanner();
                        }
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