// Suscriptores - Asigna cookies que simulan un usuario con suscripción activa
const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) {
        // Suscriptores - Cookie de estado de suscripción
        setCookie("crprm", "Suscriptor", 0);
        // Suscriptores - Cookie de suscripción
        setCookie("userIsPremium", "1", 0);
        return;
    };

    // Suscriptores - Cookie de estado de suscripción
    setCookie("crprm", "Suscriptor", 90);
    // Suscriptores - Cookie de suscripción
    setCookie("userIsPremium", "1", 90);

    // Suscriptores - URL del SVG de la extensión para el ícono de artículos restringidos
    const imageUrl = chrome.runtime.getURL("imagenes/recursos/diarios.svg");

    // Suscriptores - Inyecta un estilo que pone el ícono de la extensión como background del
    // pseudo-elemento ::before definido en elcronista-suscriptores.css para los badges de artículo restringido
    const style = document.createElement('style');
    style.textContent = `
        .story-card__restricted::before,
        .author-card__restricted::before,
        .article-head__members::before {
            background: black url(${imageUrl}) center center no-repeat;
            background-size: 22px;
        }
    `;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Agregamos la regla CSS nueva
            document.head.appendChild(style);
        });
    } else {
        // El DOM ya cargó antes de que getConfig() resolviera: ejecutamos directo.
        document.head.appendChild(style);
    }
});

console.log("Se activó Diarios Liberados");
