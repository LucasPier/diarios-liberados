
function desbloquearDatos() {
    let elementosABorrar = document.querySelectorAll("div.tp-modal, div.tp-backdrop, #onesignal-slidedown-container");
    elementosABorrar.forEach(elemento => {
        elemento.remove();
        console.log("elemento borrado!")
    });
    document.body.classList.remove("tp-modal-open");

    setTimeout(desbloquearDatos, 100);
}
desbloquearDatos();

console.log("Se activó Diarios Liberados");