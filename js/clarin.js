const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
setCookie("statusSus", "1", 90);
setCookie("susTemp", "true", 90);


const imageUrl = chrome.runtime.getURL("recursos/suscriptores_blanco_clarin.svg");

let sinReemplazos = 0;
const cambiarImagenes = () => {

    let conteo = 0;

    // reemplazamos imágenes existentes
    const images = document.querySelectorAll('img[src*="/suscriptores_blanco.svg"]');

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
    // Reemplazamos las imágenes al cargar la página
    cambiarImagenes();
});

console.log("Se activó Diarios Liberados");
