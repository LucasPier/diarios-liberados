// Suscriptores - Las cookies que simulan la suscripción están declaradas en
// js/cookies-suscriptores.js y las escribe y renueva js/cookies-runtime.js.
// Este archivo se ocupa sólo de los ajustes visuales del sitio.

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

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
