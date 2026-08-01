getConfig().then(cfg => {
    if (!cfg.feature_notificaciones) return;

    // Notificaciones - Elimina modales de Piano (tp-modal/tp-backdrop) y el slidedown de
    // notificaciones push de OneSignal. Polling cada 100ms para cubrir elementos inyectados
    // dinámicamente después de la carga inicial.
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
            function eliminarElementos() {
                let elementosABorrar = document.querySelectorAll("div.tp-modal, div.tp-backdrop, #onesignal-slidedown-container");
                elementosABorrar.forEach(elemento => {
                    elemento.remove();
                    // console.log("elemento borrado!")
                });
                document.body.classList.remove("tp-modal-open");

                setTimeout(eliminarElementos, 100);
            }
            eliminarElementos();
        }
    });
});

console.log("Se activó Diarios Liberados");
