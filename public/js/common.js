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

$(document).on('click', '#scrollToMainContent', function (event) {
    event.preventDefault();
    
    $('html, body').animate({
        scrollTop: $("#MainContentStartsHere").offset().top
    }, 500);
});


// //jQuery for ripples
// var parent, ink, d, x, y;
// $("a span.compose").click(function (e) {
//     parent = $(this).parent();
//     //create .ink element if it doesn't exist
//     if (parent.find(".ink").length == 0)
//         parent.prepend("<span class='ink'></span>");

//     ink = parent.find(".ink");
//     //incase of quick double clicks stop the previous animation
//     ink.removeClass("animate");

//     //set size of .ink
//     if (!ink.height() && !ink.width()) {
//         //use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
//         d = Math.max(parent.outerWidth(), parent.outerHeight());
//         ink.css({ height: d, width: d });
//     }

//     //get click coordinates
//     //logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;
//     x = e.pageX - parent.offset().left - ink.width() / 2;
//     y = e.pageY - parent.offset().top - ink.height() / 2;

//     //set the position and add class .animate
//     ink.css({ top: y + 'px', left: x + 'px' }).addClass("animate");
// })

