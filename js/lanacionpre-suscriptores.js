// Suscriptores - Las cookies que simulan la suscripción están declaradas en
// js/cookies-suscriptores.js y las escribe y renueva js/cookies-runtime.js.
//
// Este archivo sólo aporta el dato que el service worker no puede conseguir por su cuenta: el
// ID de usuario, que La Nación guarda en el localStorage de la página. Lo publicamos como
// override para que las renovaciones periódicas no lo pisen con el default del catálogo.
// El token de sesión no necesita nada acá: está marcado `preservarExistente` en el catálogo,
// así que si el usuario tiene uno real no se toca.

const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

getConfig().then(cfg => {
    if (!cfg.feature_suscriptores) return;

    // Suscriptores - Lee el ID de usuario existente (localStorage o cookie) para no pisarlo
    const idUsuario = (window.localStorage.getItem("CDUserId") || getCookie("usuario%5Fid") || "1");

    // Optional call: si cookies-runtime.js no llegó a cargar, esto no debe romper el script.
    window.publicarOverridesCookies?.({ UsuarioId: idUsuario });
});

console.log("Se activó Diarios Liberados");
