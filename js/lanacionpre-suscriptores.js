// Suscriptores - Utilidades para leer/escribir cookies del dominio
const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
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
    if (!cfg.feature_suscriptores) {
        setCookie("token", "0", 0);
        setCookie("xvalue", "0", 0);                        // Suscriptores - Tipo de acceso (2 = premium)
        setCookie("CDcredentialType", "0", 0);              // Suscriptores - Tipo de credencial de suscriptor
        setCookie("CDpayUser", "no", 0);                   // Suscriptores - Usuario de pago
        setCookie("CDsuscriptorType", "0", 0);              // Suscriptores - Tipo de suscriptor
        setCookie("CDUsuarioLogeado", "no", 0);            // Suscriptores - Sesión activa
        setCookie("CDUsuarioRegistrado", "no", 0);         // Suscriptores - Usuario registrado
        setCookie("usuarioDetalleClubNacion", "no", 0);    // Suscriptores - Miembro del Club La Nación
        setCookie("ProductoPremiumId", "0", 0);           // Suscriptores - IDs de productos premium habilitados
        setCookie("Crm_id", "0", 0);                        // Suscriptores - ID de CRM
        setCookie("gaComboType", "0", 0);                   // Suscriptores - Tipo de combo para GA
        setCookie("MeteringCookieServiceDown", "true", 0); // Suscriptores - Indica que el servicio de metering está activo
        setCookie("callbackCookie", "null", 90);             // Suscriptores - Callback de autenticación vacío
        setCookie("PersoTKN", "false", 0);                   // Suscriptores - Token de personalización
        setCookie("tieneClub", "no", 0);                   // Suscriptores - Tiene membresía del Club
        setCookie("UsuarioId", "0", 0);               // Suscriptores - ID de usuario (preserva el existente o usa "1")
        setCookie("UsuarioDetalleGuid", "0", 0);            // Suscriptores - GUID de detalle de usuario
        setCookie("usuario%5Fdetalle%5Fguid", "0", 0);     // Suscriptores - GUID de detalle (versión URL-encoded)
        return;
    };

    // Suscriptores - Lee el ID de usuario existente (localStorage o cookie) para no pisarlo
    const idUsuario = (window.localStorage.getItem("CDUserId") || getCookie("usuario%5Fid") || "1");

    const token = (getCookie("token") || "1");

    // console.log("ID Usuario: " + idUsuario);
    // console.log("Token: " + token);

    // Suscriptores - Escribe el conjunto de cookies que La Nación usa internamente para
    // determinar si el usuario tiene acceso premium. Corre en document_start para que
    // estén disponibles antes de que el JS del sitio las lea.
    if (token == "1") {
        setCookie("token", token, 90);
    }
    setCookie("xvalue", "2", 90);                        // Suscriptores - Tipo de acceso (2 = premium)
    setCookie("CDcredentialType", "2", 90);              // Suscriptores - Tipo de credencial de suscriptor
    setCookie("CDpayUser", "yes", 90);                   // Suscriptores - Usuario de pago
    setCookie("CDsuscriptorType", "2", 90);              // Suscriptores - Tipo de suscriptor
    setCookie("CDUsuarioLogeado", "yes", 90);            // Suscriptores - Sesión activa
    setCookie("CDUsuarioRegistrado", "yes", 90);         // Suscriptores - Usuario registrado
    setCookie("usuarioDetalleClubNacion", "yes", 90);    // Suscriptores - Miembro del Club La Nación
    setCookie("ProductoPremiumId", "1,2", 90);           // Suscriptores - IDs de productos premium habilitados
    setCookie("Crm_id", "2", 90);                        // Suscriptores - ID de CRM
    setCookie("gaComboType", "2", 90);                   // Suscriptores - Tipo de combo para GA
    setCookie("MeteringCookieServiceDown", "false", 90); // Suscriptores - Indica que el servicio de metering está activo
    setCookie("callbackCookie", "null", 90);             // Suscriptores - Callback de autenticación vacío
    setCookie("PersoTKN", "true", 90);                   // Suscriptores - Token de personalización
    setCookie("tieneClub", "yes", 90);                   // Suscriptores - Tiene membresía del Club
    setCookie("UsuarioId", idUsuario, 90);               // Suscriptores - ID de usuario (preserva el existente o usa "1")
    setCookie("UsuarioDetalleGuid", "1", 90);            // Suscriptores - GUID de detalle de usuario
    setCookie("usuario%5Fdetalle%5Fguid", "1", 90);     // Suscriptores - GUID de detalle (versión URL-encoded)
});

console.log("Se activó Diarios Liberados");
