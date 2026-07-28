getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

    // Suscriptores - URL del SVG de la extensión para el ícono de artículos restringidos
    const imageUrl = chrome.runtime.getURL("recursos/diarios.svg");

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

    document.addEventListener('DOMContentLoaded', () => {
        // Agregamos la regla CSS nueva
        document.head.appendChild(style);
    });
});

console.log("Se activó Diarios Liberados");
