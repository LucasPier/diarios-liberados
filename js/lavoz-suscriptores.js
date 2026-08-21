// Suscriptores - URLs de los íconos de la extensión que reemplazan las coronas del sitio
getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

    const imageUrl = chrome.runtime.getURL("recursos/suscripciones_lavoz.svg");
    const imageUrl2 = chrome.runtime.getURL("recursos/crown-icon_lavoz.svg");
    const imageUrl3 = chrome.runtime.getURL("recursos/crown-fill-black_lavoz.svg");

    // Suscriptores - Inyecta CSS para forzar el ícono de suscripción en los backgrounds CSS
    const style = document.createElement('style');
    style.textContent = `
        .bg-suscripcion-icon {
            background-image: url(${imageUrl})!important;
        }
    `;

    // Suscriptores - Reemplaza los íconos de corona (indicadores de contenido premium) por
    // los equivalentes de la extensión. Polling cada 100ms hasta confirmar 100 ciclos sin cambios.
    let sinReemplazos = 0;
    const cambiarImagenes = () => {

        let conteo = 0;

        // reemplazamos imágenes existentes
        const images = document.querySelectorAll('img[src="/icons/crown-fill-yellow.svg"]'),
            images2 = document.querySelectorAll('img[src="/icons/crown-yellow-icon.svg"]'),
            images3 = document.querySelectorAll('img[src="/icons/crown-fill-black.svg"]');

        images.forEach(img => {
            img.src = imageUrl;
            conteo++;
        });

        images2.forEach(img => {
            img.src = imageUrl2;
            conteo++;
        });

        images3.forEach(img => {
            img.src = imageUrl3;
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
            // Agregamos la regla CSS nueva
            document.head.appendChild(style);

            // Reemplazamos las imágenes al cargar la página
            cambiarImagenes();
        });
    } else {
        // El DOM ya cargó antes de que getConfig() resolviera: ejecutamos directo.
        document.head.appendChild(style);
        cambiarImagenes();
    }
});

console.log("Se activó Diarios Liberados");
