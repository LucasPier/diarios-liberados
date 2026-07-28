// Suscriptores - Asigna cookies de consentimiento TCF v2 (IAB Transparency & Consent Framework)
// y el hash de reprompt en localStorage. Perfil usa estas cookies para determinar si el usuario
// ya aceptó las condiciones, lo que desbloquea el acceso al contenido sin mostrar el paywall.
const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

// Suscriptores - Consentimiento adicional (campo additional_consent del TCF)
setCookie("addtl_consent", "1~", 90);
// Suscriptores - Cadena de consentimiento TCF v2 (euconsent-v2), simula haber aceptado todos los vendors
setCookie("euconsent-v2", "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA", 90);

// Suscriptores - Hash de reprompt en localStorage (evita que el sitio vuelva a pedir consentimiento)
window.localStorage.setItem("_cmpRepromptHash", "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA.1.jjXiZplvqkcl8hSvn6qOuA==");

console.log("Se activó Diarios Liberados");