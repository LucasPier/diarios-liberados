/**
 * cookies-runtime.js — Runtime de cookies de suscripción del lado de la página.
 *
 * El service worker es el motor del heartbeat (ver cookies-suscriptores.js): mantiene las
 * cookies vigentes aunque no haya ninguna pestaña del diario abierta, que es lo que garantiza
 * que viajen en la primera request de navegación. Este archivo cumple otros dos roles que el
 * service worker no puede cubrir:
 *
 *   1. ESCRITURA INMEDIATA en document_start, sin esperar el próximo tick de la alarma.
 *   2. LIMPIEZA INSTANTÁNEA cuando la extensión muere. Al desactivar o desinstalar, Chrome NO
 *      mata los content scripts de las pestañas ya abiertas: quedan huérfanos y su JS sigue
 *      corriendo, sólo se invalidan las APIs chrome.*. Aprovechamos eso: detectamos el
 *      contexto muerto vía chrome.runtime.id y borramos las cookies en el acto, en vez de
 *      esperar a que venzan solas.
 *
 * Requiere que config.js y cookies-suscriptores.js se carguen antes en el manifest.
 */

(() => {
    const grupo = grupoCookiesPorHost(location.hostname);

    // El sitio no tiene cookies en el catálogo (ej. Olé comparte content script con Clarín).
    // La API queda definida igual, como no-op, para que los scripts de cada diario puedan
    // llamarla sin averiguar antes si su host está en el catálogo.
    if (!grupo) {
        window.publicarOverridesCookies = () => {};
        return;
    }

    // Cada cuánto revisamos el contexto y refrescamos. En pestañas de fondo Chrome throttlea
    // los timers a ~1/minuto: por eso el TTL tiene 5x de margen y no dependemos de este ciclo.
    const INTERVALO_MS = 30 * 1000;

    let activo = null;        // null = todavía no sabemos qué dice la config
    let yaLimpiamos = false;
    let overrides = {};
    let ticking = null;

    const leerCookie = (nombre) => {
        const prefijo = nombre + "=";
        for (let parte of document.cookie.split(";")) {
            parte = parte.trimStart();
            if (parte.startsWith(prefijo)) return parte.substring(prefijo.length);
        }
        return null;
    };

    const escribirCookie = (nombre, valor) => {
        const vence = new Date(Date.now() + COOKIE_TTL_MINUTOS * 60 * 1000).toUTCString();
        document.cookie = `${nombre}=${valor}; expires=${vence}; path=/`;
    };

    // Fecha explícita en el pasado. Usar "ahora" como hacía el código anterior funciona de
    // casualidad y depende de que el navegador procese la escritura después del milisegundo.
    const borrarCookie = (nombre) => {
        document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    };

    /** ¿Sigue viva la extensión? Si fue desactivada, desinstalada o actualizada, esto da false. */
    const extensionViva = () => {
        try {
            return Boolean(chrome.runtime && chrome.runtime.id);
        } catch {
            return false;
        }
    };

    const aplicarCookies = () => {
        for (const cookie of grupo.cookies) {
            // El usuario tiene una credencial real: no la pisamos.
            if (cookie.preservarExistente) {
                const actual = leerCookie(cookie.nombre);
                if (actual !== null && actual !== cookie.valor) continue;
            }
            escribirCookie(cookie.nombre, valorCookie(cookie, overrides));
        }

        for (const [clave, valor] of Object.entries(grupo.localStorage || {})) {
            try {
                window.localStorage.setItem(clave, valor);
            } catch { /* localStorage bloqueado por el usuario o el sitio */ }
        }

        yaLimpiamos = false;
    };

    const limpiarCookies = () => {
        if (yaLimpiamos) return;
        yaLimpiamos = true;

        for (const cookie of grupo.cookies) {
            if (cookie.preservarExistente) {
                const actual = leerCookie(cookie.nombre);
                if (actual !== null && actual !== cookie.valor) continue;
            }
            borrarCookie(cookie.nombre);
        }

        // localStorage no vence solo: ésta es la única oportunidad de limpiarlo. Si el usuario
        // desinstala sin ninguna pestaña del sitio abierta, estas claves quedan hasta la
        // próxima visita (donde ya no habrá extensión para borrarlas). Limitación conocida:
        // no hay API que permita hacer mejor que esto.
        for (const clave of Object.keys(grupo.localStorage || {})) {
            try {
                window.localStorage.removeItem(clave);
            } catch { /* idem */ }
        }
    };

    const tick = () => {
        // Contexto huérfano: la extensión ya no existe. Limpiamos y cortamos el ciclo para no
        // quedar renovando cookies de una extensión desinstalada.
        if (!extensionViva()) {
            limpiarCookies();
            clearInterval(ticking);
            document.removeEventListener("visibilitychange", alVolverAlFrente);
            return;
        }

        if (activo === true) aplicarCookies();
        else if (activo === false) limpiarCookies();
    };

    // En pestañas de fondo el intervalo se throttlea; al volver al frente revisamos enseguida
    // para que la limpieza del huérfano se note al instante.
    const alVolverAlFrente = () => {
        if (!document.hidden) tick();
    };

    /**
     * API para los scripts específicos de cada diario: publica valores calculados desde la
     * página (ej. el ID de usuario que La Nación guarda en localStorage) para que tanto este
     * runtime como el service worker los usen al renovar, en vez del default del catálogo.
     */
    window.publicarOverridesCookies = (valores) => {
        overrides = { ...overrides, ...valores };
        if (activo === true) aplicarCookies();
        if (!extensionViva()) return;
        chrome.storage.local.get({ cookie_overrides: {} }).then(({ cookie_overrides }) => {
            cookie_overrides[grupo.id] = { ...(cookie_overrides[grupo.id] || {}), ...valores };
            return chrome.storage.local.set({ cookie_overrides });
        }).catch(() => { /* contexto invalidado entre medio */ });
    };

    // Overrides de visitas anteriores: los necesitamos ANTES de la primera escritura para no
    // pisar el ID de usuario real con el default del catálogo.
    const overridesGuardados = chrome.storage.local
        .get({ cookie_overrides: {} })
        .then(({ cookie_overrides }) => { overrides = cookie_overrides[grupo.id] || {}; })
        .catch(() => { /* sin overrides, se usan los defaults */ });

    Promise.all([overridesGuardados, getConfig()]).then(([, cfg]) => {
        activo = Boolean(cfg.feature_suscriptores);
        tick();
        ticking = setInterval(tick, INTERVALO_MS);
        document.addEventListener("visibilitychange", alVolverAlFrente);
    });

    // El usuario cambia la config desde el popup con la pestaña abierta: reaccionamos sin
    // esperar una recarga. Sin esto el ciclo local seguiría reescribiendo cookies apagadas.
    chrome.storage.onChanged.addListener((cambios, area) => {
        if (area !== "sync" || !("feature_suscriptores" in cambios)) return;
        activo = Boolean(cambios.feature_suscriptores.newValue);
        tick();
    });
})();
