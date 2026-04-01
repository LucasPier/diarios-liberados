const urlImagenSocios = chrome.runtime.getURL("recursos/socios_p12.svg");
const urlImagenSocios2 = chrome.runtime.getURL("recursos/socios_v2_p12.svg");
window.postMessage({ type: "FROM_EXT", url: urlImagenSocios, url2: urlImagenSocios2 }, "*");



const agregarLabel = () => {
    // reemplazamos imágenes existentes
    const images = document.querySelectorAll('img[src*="p12-label/label_logo_socios.svg"]');

    console.log(images);

    images.forEach(img => {
        img.src = urlImagenSocios2;
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log("Mutation label");
            // Revisamos cada nodo que fue eliminado en esta mutación
            mutation.removedNodes.forEach((node) => {
                // Verificamos si es el label
                if (node.querySelector('img[class*="label-socios svg-logo"]')) {
                    console.log('¡Elemento detectado como eliminado!');
                    observer.disconnect();
                    agregarLabel();
                }
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

console.log("Se activó Diarios Liberados");