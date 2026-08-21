/**
 * airedesantafe-spa.js — Interceptor de navegación SPA (world: MAIN)
 *
 * CONTEXTO: airedesantafe.com.ar usa un SPA casero. Al navegar, el código del
 * sitio (función get() dentro del IIFE) hace un XHR a la nueva URL, y cuando
 * termina borra todos los <link rel="stylesheet"> del documento, excepto los
 * que tienen el atributo [data-component-style] o son de terceros conocidos.
 *
 * SOLUCIÓN PRINCIPAL: css-loader.js agrega data-component-style a cada <link>
 * que inyecta, lo que hace que el sitio los omita en su limpieza.
 *
 * SOLUCIÓN DE RESPALDO (este script): intercepta history.pushState y popstate
 * para disparar "dl:navigate" y reinyectar CSS en caso de que alguna navegación
 * se salte el mecanismo de protección del atributo.
 *
 * Nota: processInfo() es una función LOCAL dentro del IIFE del sitio, no está
 * en window, por lo que no se puede interceptar desde un content script.
 */

(function () {
    if (window.__dlAireSpaLoaded) return;
    window.__dlAireSpaLoaded = true;

    function dispatchNavigate() {
        window.dispatchEvent(new Event('dl:navigate'));
    }

    // El sitio llama a history.pushState dentro del XHR callback (después de
    // pisar el DOM). Nuestro evento se dispara justo después, cuando el nuevo
    // contenido ya está en la página.
    const _pushState = history.pushState.bind(history);
    history.pushState = function (...args) {
        _pushState(...args);
        dispatchNavigate();
    };

    // Navegación atrás/adelante del browser
    window.addEventListener('popstate', dispatchNavigate);
})();
