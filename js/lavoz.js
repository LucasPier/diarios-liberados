// Agregamos la regla CSS nueva
document.head.appendChild(style);

// reemplazamos imágenes existentes
const images = document.querySelectorAll('img[src="/icons/crown-fill-yellow.svg"]'),
    images2 = document.querySelectorAll('img[src="/icons/crown-yellow-icon.svg"]'),
    images3 = document.querySelectorAll('img[src="/icons/crown-fill-black.svg"]');

// console.log(images, images2, images3);

images.forEach(img => {
    img.src = imageUrl;
});

images2.forEach(img => {
    img.src = imageUrl2;
});

images3.forEach(img => {
    img.src = imageUrl3;
});

console.log("Se activó Diarios Liberados");