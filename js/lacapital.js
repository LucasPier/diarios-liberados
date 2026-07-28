
// Suscriptores - URL del ícono de suscriptores de la extensión (reemplaza el original del sitio)
const imageUrl = chrome.runtime.getURL("recursos/suscriptores_lacapital.svg");

// Suscriptores - Reemplaza el ícono de suscriptores del sitio por el de la extensión.
// Polling cada 100ms hasta confirmar 100 ciclos sin imágenes para reemplazar.
let sinReemplazos = 0;
const cambiarImagenes = () => {

    let conteo = 0;

    // reemplazamos imágenes existentes
    const images = document.querySelectorAll('img[src*="adjuntos/203/svg/100/000/0100000197.svg"]');

    // console.log(images, images2, images3);

    images.forEach(img => {
        img.src = imageUrl;
        conteo++;
    });

    if(conteo === 0) {
        sinReemplazos++;
    }else {
        sinReemplazos = 0;
    }

    if(sinReemplazos < 100) {
        setTimeout(cambiarImagenes, 100);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    if(document.body){
        // Notificaciones / Publicidad - Elimina modales de Piano (tp-modal/tp-backdrop) y el
        // slidedown de notificaciones push de OneSignal. Polling cada 100ms para cubrir
        // elementos inyectados dinámicamente después de la carga inicial.
        function eliminarElementos() {
            let elementosABorrar = document.querySelectorAll("div.tp-modal, div.tp-backdrop, #onesignal-slidedown-container");
            elementosABorrar.forEach(elemento => {
                elemento.remove();
                // console.log("elemento borrado!")
            });
            document.body.classList.remove("tp-modal-open");

            setTimeout(eliminarElementos, 100);
        }
        // Reemplazamos las imágenes al cargar la página
        cambiarImagenes();
        eliminarElementos();
    }
});


console.log("Se activó Diarios Liberados");