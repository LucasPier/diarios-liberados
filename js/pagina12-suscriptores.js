// Suscriptores - URLs de los SVG de socios de la extensión (reemplazan los del sitio)
const urlImagenSocios = chrome.runtime.getURL("recursos/socios_p12.svg");
const urlImagenSocios2 = chrome.runtime.getURL("recursos/socios_v2_p12.svg");

// Guardamos en dataset y enviamos postMessage de forma SÍNCRONA apenas carga el script en contexto ISOLATED
// para que el contexto MAIN (pagina12dom-suscriptores.js) las tenga disponibles sin esperar promesas.
document.documentElement.dataset.dlSociosUrl = urlImagenSocios;
document.documentElement.dataset.dlSociosUrl2 = urlImagenSocios2;
window.postMessage({ type: "FROM_EXT", url: urlImagenSocios, url2: urlImagenSocios2 }, "*");

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

    // Re-enviar por si el listener del contexto MAIN se registró después
    window.postMessage({ type: "FROM_EXT", url: urlImagenSocios, url2: urlImagenSocios2 }, "*");

    // Suscriptores - Reemplaza el label de "SOCI@S" por el SVG de la extensión.
    // Usa MutationObserver para detectar cuando el sitio lo vuelve a insertar.
    const agregarLabel = () => {
        const images = document.querySelectorAll('img[src*="p12-label/label_logo_socios.svg"]');

        const verificarNode = (node) => {
            if (typeof node === "object" && node.querySelector && node.querySelector('img[class*="label-socios svg-logo"]')) {
                observer.disconnect();
                agregarLabel();
            }
        };

        images.forEach(img => {
            img.src = urlImagenSocios2;
        });

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
    };

    window.document.addEventListener("DOMContentLoaded", () => {
        agregarLabel();
    });
});

console.log("Se activó Diarios Liberados");
