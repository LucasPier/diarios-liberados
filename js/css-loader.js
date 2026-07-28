/**
 * css-loader.js — Inyector dinámico de CSS para Diarios Liberados
 *
 * Expone `injectCSS(path)` que crea un <link rel="stylesheet"> usando
 * chrome.runtime.getURL para resolver la ruta dentro de la extensión.
 *
 * Usa var y window guard para evitar SyntaxError por re-declaración.
 */

var injectCSS = window.injectCSS || function injectCSS(path) {
    const href = chrome.runtime.getURL(path);

    const doInject = () => {
        // Evitar inyección duplicada
        if (document.querySelector(`link[href="${href}"]`)) return;

        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        (document.head || document.documentElement).appendChild(link);
    };

    if (document.head) {
        doInject();
    } else {
        document.addEventListener('DOMContentLoaded', doInject, { once: true });
    }
};
window.injectCSS = injectCSS;
