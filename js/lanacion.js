const desbloquear = () => {
    const paginasBloqueadas = document.querySelectorAll('#Panel_pagesViewContainer .page:not(.page-unlocked)');

    console.log("Paginas bloqueadas: " + paginasBloqueadas.length);

    paginasBloqueadas.forEach(function (pagina) {
        pagina.classList.add('page-unlocked');
    });
    setTimeout(desbloquear, 100);
}
window.addEventListener('load', function () {
    desbloquear();
});