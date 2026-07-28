const urlImagenSocios = chrome.runtime.getURL("recursos/socios_p12.svg");
const urlImagenSocios2 = chrome.runtime.getURL("recursos/socios_v2_p12.svg");
window.postMessage({ type: "FROM_EXT", url: urlImagenSocios, url2: urlImagenSocios2 }, "*");



const agregarLabel = () => {
    // reemplazamos imágenes existentes
    const images = document.querySelectorAll('img[src*="p12-label/label_logo_socios.svg"]'),
    verificarNode = (node)=>{
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
            // Revisamos cada nodo que fue eliminado o agregado en esta mutación
            mutation.removedNodes.forEach((node) => {
                // Verificamos si es el label
                verificarNode(node);
            });
            mutation.addedNodes.forEach((node) => {
                // Verificamos si es el label
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

console.log("Se activó Diarios Liberados");