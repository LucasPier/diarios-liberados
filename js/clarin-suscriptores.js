// Suscriptores - Asigna cookies que simulan un usuario con suscripción activa
const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) {
        // Suscriptores - Cookie de estado de suscripción (statusSus=0 = suscriptor no activo)
        setCookie("statusSus", "0", 0);
        // Suscriptores - Cookie de suscripción temporal (susTemp=false = acceso no habilitado)
        setCookie("susTemp", "false", 0);
        return;
    };

    // Suscriptores - Cookie de estado de suscripción (statusSus=1 = suscriptor activo)
    setCookie("statusSus", "1", 90);
    // Suscriptores - Cookie de suscripción temporal (susTemp=true = acceso habilitado)
    setCookie("susTemp", "true", 90);

    // Suscriptores - URL del ícono de suscriptores de la extensión (reemplaza el original del sitio)
    const imageUrl = chrome.runtime.getURL("recursos/suscriptores_blanco_clarin.svg");

    // Suscriptores - Reemplaza el ícono de suscriptores del sitio por el de la extensión,
    // evitando que quede en blanco (el sitio bloquea la imagen original para no suscriptores).
    // Polling cada 100ms hasta confirmar 100 ciclos sin imágenes para reemplazar.
    let sinReemplazos = 0;
    const cambiarImagenes = () => {

        let conteo = 0;

        // reemplazamos imágenes existentes
        const images = document.querySelectorAll('img[src*="/suscriptores_blanco.svg"]');

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

    document.addEventListener('DOMContentLoaded', () => {
        // Reemplazamos las imágenes al cargar la página
        cambiarImagenes();
    });
});

console.log("Se activó Diarios Liberados");
