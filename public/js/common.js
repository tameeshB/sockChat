// var fb = document.querySelector('.loginBtn--facebook');
// fb.addEventListener('click',function () { 
//     window.location.replace('/');
// })

(function () {
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('#navbarMenu');
    burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
})();

