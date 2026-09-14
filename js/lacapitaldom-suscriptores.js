/**
 * lacapitaldom-suscriptores.js — Mundo MAIN, sólo flipbook.lacapital.com.ar
 *
 * El visor de la edición impresa no renderiza el PDF hasta que un gate de Wyleex
 * confirma que el usuario es suscriptor. El inline del sitio arma el gate así:
 *
 *     window.paywall = window.paywall || {};
 *     window.paywall.queue = window.paywall.queue || [];
 *     window.paywall.queue.push(["addEventListener", "checked", callback]);
 *     // ...y recién ahí inyecta pw.js, que es quien dispara "checked".
 *
 * Esos dos `|| {}` son la puerta: si el objeto ya existe, el sitio respeta el nuestro.
 * Sembramos la cola con un `push` interceptado y ejecutamos el callback en el acto,
 * con `paywall.auth` mintiendo que hay sesión de suscriptor.
 *
 * POR QUÉ no esperamos el evento "checked": nunca llega. La regla dinámica id 3 de
 * sw.js bloquea cdn.wyleex.com cuando la feature está activa, así que pw.js no carga
 * y el `onerror` del sitio muestra el paywall. Hay que resolver ANTES que ese onerror.
 *
 * POR QUÉ la siembra es síncrona y no va detrás de `iniciarSiHabilitado()` como en los
 * otros scripts del mundo MAIN: el flag se lee del dataset que escribe loader.js, y eso
 * depende de un getConfig() async. El push del sitio ocurre al terminar de parsear el
 * body, sin avisar: si llegamos después, ya no hay nada que interceptar. Entonces
 * sembramos siempre (es inocuo) y la decisión del flag se toma dentro del hook, que sí
 * puede esperar — el sitio se da 9 segundos antes de rendirse.
 */

// Suscriptores - Lee el flag del dataset que escribe loader.js (mundo ISOLATED).
// Si todavía no está, espera el evento `dl:configReady` con un reintento de respaldo.
function conFlagSuscriptores(accion, reintentos) {
    const val = document.documentElement.dataset.dlSuscriptores;

    if (val === 'false') return;    // Feature deshabilitada por el usuario: no intervenimos.
    if (val === 'true') { accion(); return; }

    if (reintentos > 0) {
        document.addEventListener(
            'dl:configReady',
            () => conFlagSuscriptores(accion, 0),
            { once: true }
        );
        setTimeout(() => conFlagSuscriptores(accion, reintentos - 1), 150);
    }
}

// Suscriptores - Falsea la sesión y ejecuta el callback del gate.
let _gateResuelto = false;

function liberarEdicionImpresa(callback) {
    if (_gateResuelto) return;
    _gateResuelto = true;

    // El sitio acepta las dos grafías (`u.subscribed || u.suscribed`): devolvemos ambas
    // porque no sabemos cuál mira la versión del visor que esté servida.
    window.paywall.auth = {
        user: () => ({ subscribed: true, suscribed: true }),
        isLogged: () => true
    };

    try {
        callback();
        console.log("Edición impresa liberada");
    } catch (e) {
        console.warn("No se pudo liberar la edición impresa:", e);
    }
}

// Suscriptores - Siembra la cola del gate antes de que corra el inline del sitio.
(function () {
    window.paywall = window.paywall || {};

    const cola = window.paywall.queue || [];
    const pushOriginal = cola.push.bind(cola);

    cola.push = function (...entradas) {
        const resultado = pushOriginal(...entradas);

        entradas.forEach(entrada => {
            if (!Array.isArray(entrada)) return;
            const [metodo, evento, callback] = entrada;
            if (metodo !== 'addEventListener' || evento !== 'checked') return;
            if (typeof callback !== 'function') return;

            conFlagSuscriptores(() => liberarEdicionImpresa(callback), 1);
        });

        return resultado;
    };

    window.paywall.queue = cola;
})();
