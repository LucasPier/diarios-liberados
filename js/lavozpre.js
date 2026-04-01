const imageUrl = chrome.runtime.getURL("recursos/suscripciones_lavoz.svg");
const imageUrl2 = chrome.runtime.getURL("recursos/crown-icon_lavoz.svg");
const imageUrl3 = chrome.runtime.getURL("recursos/crown-fill-black_lavoz.svg");

const style = document.createElement('style');
style.textContent = `
    .bg-suscripcion-icon {
        background-image: url(${imageUrl})!important;
    }
`;