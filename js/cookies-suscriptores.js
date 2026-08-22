/**
 * cookies-suscriptores.js — Catálogo declarativo de las cookies de suscripción simulada.
 *
 * EL PROBLEMA
 * Chrome no expone ningún hook de desinstalación ni de desactivación que permita ejecutar
 * código de limpieza (setUninstallURL sólo abre una URL, onSuspend es del ciclo de vida del
 * service worker). Si las cookies se escriben con vencimiento largo, quedan en el navegador
 * para siempre aunque el usuario desactive o desinstale la extensión.
 *
 * LA ESTRATEGIA
 * Las cookies se escriben con un TTL corto (COOKIE_TTL_MINUTOS) y el service worker las
 * renueva periódicamente (COOKIE_RENOVACION_MINUTOS) vía chrome.alarms. Mientras la
 * extensión está activa siempre están vigentes; cuando se desactiva o desinstala nadie las
 * renueva y vencen solas. No hay nada que limpiar porque nada sobrevive por sí mismo.
 *
 * POR QUÉ 5 Y 1
 * El mínimo garantizado de chrome.alarms es 1 minuto. Un TTL de 5x el período de renovación
 * deja margen para 4 ciclos perdidos seguidos: service worker dormido que tarda en despertar,
 * la máquina suspendida un rato, un pico de carga. Y el residuo máximo tras desinstalar pasa
 * de 90 días a 5 minutos. Subir COOKIE_RENOVACION_MINUTOS abarata el heartbeat a costa de ese
 * margen; nunca lo pongas a más de un tercio del TTL.
 *
 * ARCHIVO COMPARTIDO
 * Lo cargan tanto el service worker (importScripts) como los content scripts (manifest), por
 * eso usa `var` + guarda sobre globalThis: es idempotente si se evalúa más de una vez.
 */

// Vigencia de cada cookie escrita, en minutos.
var COOKIE_TTL_MINUTOS = globalThis.COOKIE_TTL_MINUTOS || 5;

// Cada cuánto el service worker vuelve a escribirlas.
var COOKIE_RENOVACION_MINUTOS = globalThis.COOKIE_RENOVACION_MINUTOS || 1;

/**
 * Catálogo de cookies por sitio. Agregar un diario nuevo es agregar una entrada acá:
 * ni el service worker ni el runtime de los content scripts necesitan tocarse.
 *
 * dominios → sufijos que identifican al sitio. Sirven para que el runtime de la página sepa a
 *           qué grupo pertenece el host que está visitando, incluidos subdominios que no
 *           estén en `hosts`.
 * hosts   → hosts exactos que el service worker mantiene calientes de forma preventiva, para
 *           que la cookie ya esté en el navegador cuando llega la primera request de
 *           navegación. Se escriben host-only (sin atributo Domain), replicando exactamente
 *           lo que hacía document.cookie. Usar cookies de dominio (.diario.com) ahorraría
 *           escrituras pero puede convivir con una cookie host-only del propio sitio: quedan
 *           dos con el mismo nombre y el JS del sitio lee la que le pinta. No vale el riesgo.
 * cookies → nombre + valor, más dos flags opcionales:
 *           · preservarExistente → si ya hay una cookie con un valor distinto del nuestro,
 *             es del usuario real: no la pisamos ni la borramos.
 *           · override → el valor puede reemplazarse en runtime por uno calculado desde la
 *             página (ver publicarOverrides en cookies-runtime.js). El `valor` es el default.
 */
var COOKIES_SUSCRIPTORES = globalThis.COOKIES_SUSCRIPTORES || [
    {
        id: "clarin",
        dominios: ["clarin.com", "ole.com.ar"],
        hosts: ["clarin.com", "www.clarin.com", "elle.clarin.com", "ole.com.ar", "www.ole.com.ar"],
        cookies: [
            { nombre: "statusSus", valor: "1" },    // Estado de suscripción (1 = suscriptor activo)
            { nombre: "susTemp", valor: "true" },   // Suscripción temporal (true = acceso habilitado)
        ],
    },
    {
        id: "elcronista",
        dominios: ["cronista.com"],
        hosts: ["cronista.com", "www.cronista.com"],
        cookies: [
            { nombre: "crprm", valor: "Suscriptor" },  // Estado de suscripción
            { nombre: "userIsPremium", valor: "1" },   // Suscripción premium
        ],
    },
    {
        id: "lanacion",
        dominios: ["lanacion.com.ar", "somosohlala.com", "rollingstone.com"],
        hosts: [
            "lanacion.com.ar", "www.lanacion.com.ar",
            "somosohlala.com", "www.somosohlala.com",
            "rollingstone.com", "www.rollingstone.com",
        ],
        cookies: [
            // Token de sesión. Si el usuario tiene uno real (valor != "1") no lo tocamos.
            { nombre: "token", valor: "1", preservarExistente: true },
            { nombre: "xvalue", valor: "2" },                        // Tipo de acceso (2 = premium)
            { nombre: "CDcredentialType", valor: "2" },              // Tipo de credencial de suscriptor
            { nombre: "CDpayUser", valor: "yes" },                   // Usuario de pago
            { nombre: "CDsuscriptorType", valor: "2" },              // Tipo de suscriptor
            { nombre: "CDUsuarioLogeado", valor: "yes" },            // Sesión activa
            { nombre: "CDUsuarioRegistrado", valor: "yes" },         // Usuario registrado
            { nombre: "usuarioDetalleClubNacion", valor: "yes" },    // Miembro del Club La Nación
            { nombre: "ProductoPremiumId", valor: "1,2" },           // IDs de productos premium habilitados
            { nombre: "Crm_id", valor: "2" },                        // ID de CRM
            { nombre: "gaComboType", valor: "2" },                   // Tipo de combo para GA
            { nombre: "MeteringCookieServiceDown", valor: "false" }, // Servicio de metering activo
            { nombre: "callbackCookie", valor: "null" },             // Callback de autenticación vacío
            { nombre: "PersoTKN", valor: "true" },                   // Token de personalización
            { nombre: "tieneClub", valor: "yes" },                   // Tiene membresía del Club
            // ID de usuario: el content script lo lee de localStorage y lo publica como override.
            { nombre: "UsuarioId", valor: "1", override: true },
            { nombre: "UsuarioDetalleGuid", valor: "1" },            // GUID de detalle de usuario
            { nombre: "usuario%5Fdetalle%5Fguid", valor: "1" },      // GUID de detalle (URL-encoded)
        ],
    },
    {
        id: "perfil",
        dominios: ["perfil.com", "batimes.com.ar", "canalnet.tv"],
        hosts: [
            "perfil.com", "www.perfil.com",
            "noticias.perfil.com", "442.perfil.com", "caras.perfil.com", "parabrisas.perfil.com",
            "fortuna.perfil.com", "weekend.perfil.com", "supercampo.perfil.com", "look.perfil.com",
            "luz.perfil.com", "mia.perfil.com", "lunateen.perfil.com", "horizonte.perfil.com",
            "exitoina.perfil.com", "brasil.perfil.com", "marieclaire.perfil.com", "radio.perfil.com",
            "rouge.perfil.com", "hombre.perfil.com",
            "batimes.com.ar", "www.batimes.com.ar",
            "canalnet.tv", "www.canalnet.tv",
        ],
        cookies: [
            // Consentimiento adicional (campo additional_consent del TCF v2)
            { nombre: "addtl_consent", valor: "1~" },
            // Cadena de consentimiento TCF v2: simula haber aceptado todos los vendors
            { nombre: "euconsent-v2", valor: "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA" },
        ],
        // Claves de localStorage que acompañan a las cookies. Ver la nota sobre limpieza en
        // cookies-runtime.js: localStorage no vence, sólo se puede borrar con la pestaña abierta.
        localStorage: {
            _cmpRepromptHash: "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA.1.jjXiZplvqkcl8hSvn6qOuA==",
        },
    },
];

/**
 * Devuelve el grupo de cookies que corresponde a un hostname, o null si el sitio no usa
 * cookies (ej. Olé comparte content script con Clarín pero no tiene cookies propias).
 */
var grupoCookiesPorHost = globalThis.grupoCookiesPorHost || function grupoCookiesPorHost(hostname) {
    const host = String(hostname || "").toLowerCase();
    return COOKIES_SUSCRIPTORES.find(
        g => g.dominios.some(d => host === d || host.endsWith("." + d))
    ) || null;
};

/**
 * Resuelve el valor final de una cookie aplicando el override publicado desde la página,
 * si la cookie lo admite y hay uno guardado.
 */
var valorCookie = globalThis.valorCookie || function valorCookie(cookie, overrides) {
    if (cookie.override && overrides && overrides[cookie.nombre]) {
        return String(overrides[cookie.nombre]);
    }
    return cookie.valor;
};

globalThis.COOKIE_TTL_MINUTOS = COOKIE_TTL_MINUTOS;
globalThis.COOKIE_RENOVACION_MINUTOS = COOKIE_RENOVACION_MINUTOS;
globalThis.COOKIES_SUSCRIPTORES = COOKIES_SUSCRIPTORES;
globalThis.grupoCookiesPorHost = grupoCookiesPorHost;
globalThis.valorCookie = valorCookie;
