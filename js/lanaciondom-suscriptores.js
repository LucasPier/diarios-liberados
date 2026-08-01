// Suscriptores - Verifica si la feature está habilitada en la config del usuario.
// loader.js (mundo ISOLATED) setea este atributo en document.documentElement.
// Si no está disponible aún (storage async), reintenta una vez con 150ms de demora.
let _iniciadoLanacionDom = false;

function iniciarSiHabilitado(reintentos) {
    if (_iniciadoLanacionDom) return;
    const val = document.documentElement.dataset.dlSuscriptores;
    if (val === 'false') return; // Feature deshabilitada por el usuario
    if (val === undefined && reintentos > 0) {
        setTimeout(() => iniciarSiHabilitado(reintentos - 1), 150);
        return;
    }
    _iniciadoLanacionDom = true;
    iniciar();
}

/**
 * Utilitario seguro para definir getters/setters en `window` sin provocar
 * `TypeError: Cannot redefine property` si la propiedad ya fue congelada/definida.
 */
function definirInterceptador(prop, transformFn) {
    let internalVal = window[prop];

    const desc = Object.getOwnPropertyDescriptor(window, prop);
    if (desc && !desc.configurable) {
        if (window[prop]) transformFn(window[prop]);
        return;
    }

    try {
        Object.defineProperty(window, prop, {
            set: function (val) {
                if (val) transformFn(val);
                internalVal = val;
            },
            get: function () {
                return internalVal;
            },
            configurable: true
        });
    } catch (e) {
        console.warn(`No se pudo definir interceptador para ${prop}:`, e);
        if (window[prop]) transformFn(window[prop]);
    }
}

function iniciar() {
    (function () {
        console.log("¡Fusion iniciado!");

        // Suscriptores - Intercepta la asignación del objeto global `Fusion` (framework de La Nación)
        // antes de que el sitio lo lea. Al poner IS_DEV=true y API_ENV="dev" se fuerza el modo
        // desarrollo, que omite las validaciones de paywall en el front-end.
        definirInterceptador('Fusion', (val) => {
            if (val && val.environment && typeof val.environment.IS_DEV !== "undefined") {
                console.log("¡Fusion interceptado!", val);
                val.environment.IS_DEV = true;
                val.environment.API_ENV = "dev";
            }
        });

    })();
}
iniciarSiHabilitado(1);
