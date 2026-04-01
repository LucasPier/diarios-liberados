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
const idUsuario = (window.localStorage.getItem("CDUserId") || getCookie("usuario%5Fid") || "1");

const token = (getCookie("token") || "1");

console.log("ID Usuario: " + idUsuario);
console.log("Token: " + token);

if (token == "1") {
    setCookie("token", token, 90);
}
//setCookie("access-token", "true", 90);
setCookie("xvalue", "2", 90);
setCookie("CDcredentialType", "2", 90);
// setCookie("CDUserId", "6050492", 90);
setCookie("CDpayUser", "yes", 90);
setCookie("CDsuscriptorType", "2", 90);
setCookie("CDUsuarioLogeado", "yes", 90);
setCookie("CDUsuarioRegistrado", "yes", 90);
setCookie("usuarioDetalleClubNacion", "yes", 90);
// setCookie("usuarioemail", "pier@lanacion.com.ar", 90);
setCookie("ProductoPremiumId", "1,2", 90);
setCookie("Crm_id", "2", 90);
setCookie("gaComboType", "2", 90);
// setCookie("usuario%5Fid", "6050492", 90);
// setCookie("usuariosexo", "m", 90);
setCookie("MeteringCookieServiceDown", "false", 90);
// setCookie("UsuarioDetalleNombre", "Juan", 90);
// setCookie("UsuarioDetalleApellido", "Perez", 90);
setCookie("callbackCookie", "null", 90);
setCookie("PersoTKN", "true", 90);
setCookie("tieneClub", "yes", 90);
// setCookie("usuario%5Fusuario", "lpier", 90);
// setCookie("UsuarioUsuario", "luca95838", 90);
setCookie("UsuarioId", idUsuario, 90);
// setCookie("UsuarioDetalleNick", "luca95838", 90);
// setCookie("usuario%5Fdetalle%5Fnick", "lpier", 90);
setCookie("UsuarioDetalleGuid", "1", 90);
setCookie("usuario%5Fdetalle%5Fguid", "1", 90);
// setCookie("usuarioanio", "1986", 90);
// setCookie("metering_arc", "black", 90);
// setCookie("token", "1", 90);
// setCookie("token", "1", 90);
// setCookie("token", "1", 90);
// setCookie("token", "1", 90);

console.log("Se activó Diarios Liberados");
