/**
 * config.js — Módulo compartido de configuración de Diarios Liberados
 *
 * Expone `getConfig()`, una Promise que resuelve con las tres flags de features.
 * Debe incluirse PRIMERO en cada entrada "js" del content_scripts del manifest.
 *
 * Usa var y window guard para ser idempotente si se ejecuta múltiples veces
 * en la misma pestaña (ej. scripts en document_start y document_end).
 */

var getConfig = window.getConfig || function getConfig() {
    return chrome.storage.sync.get({
        feature_publicidad:     true,
        feature_notificaciones: true,
        feature_suscriptores:   true
    });
};
window.getConfig = getConfig;
