
// Suscriptores - URL del SVG de la extensión para el ícono de artículos restringidos
const imageUrl = chrome.runtime.getURL("recursos/diarios.svg");

// Suscriptores - Inyecta un estilo que pone el ícono de la extensión como background del
// pseudo-elemento ::before definido en elcronista.css para los badges de artículo restringido
const style = document.createElement('style');
style.textContent = `
    .story-card__restricted::before,
    .author-card__restricted::before,
    .article-head__members::before {
        background: black url(${imageUrl}) center center no-repeat;
        background-size: 22px;
    }
`;

// let sinReemplazos = 0;
// const cambiarImagenes = () => {

//     let conteo = 0;

//     // reemplazamos imágenes existentes
//     const images = document.querySelectorAll('img[src="/icons/crown-fill-yellow.svg"]');

//     images.forEach(img => {
//         img.src = imageUrl;
//         conteo++;
//     });

//     if(conteo === 0) {
//         sinReemplazos++;
//     }else {
//         sinReemplazos = 0;
//     }

//     if(sinReemplazos < 100) {
//         setTimeout(cambiarImagenes, 100);
//     }

// }

document.addEventListener('DOMContentLoaded', () => {
    // Agregamos la regla CSS nueva
    document.head.appendChild(style);

    // Reemplazamos las imágenes al cargar la página
    // cambiarImagenes();
});

console.log("Se activó Diarios Liberados");