
// Suscriptores - URL del ícono de suscriptores de la extensión (reemplaza el original del sitio)
const imageUrl = chrome.runtime.getURL("recursos/suscriptores_lacapital.svg");

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

    // Suscriptores - Reemplaza el ícono de suscriptores del sitio por el de la extensión.
    // Polling cada 100ms hasta confirmar 100 ciclos sin imágenes para reemplazar.
    let sinReemplazos = 0;
    const cambiarImagenes = () => {

        let conteo = 0;

        // reemplazamos imágenes existentes
        const images = document.querySelectorAll('img[src*="adjuntos/203/svg/100/000/0100000197.svg"]');

        images.forEach(img => {
            img.src = imageUrl;
            conteo++;
        });

        if (conteo === 0) {
            sinReemplazos++;
        } else {
            sinReemplazos = 0;
        }

        if (sinReemplazos < 100) {
            setTimeout(cambiarImagenes, 100);
        }

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Reemplazamos las imágenes al cargar la página
            cambiarImagenes();
        });
    } else {
        // El DOM ya cargó antes de que getConfig() resolviera: ejecutamos directo.
        cambiarImagenes();
    }
});


console.log("Se activó Diarios Liberados");
