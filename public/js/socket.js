function removeDup(arr) {
    let unique_array = Array.from(new Set(arr))
    return unique_array
}
$(document).ready(function () {
    $("#messageSend").width($("#message-feed").width());
    if ($(window).width() >= 900)
        $("#makeVisible").delay(100).fadeIn();
    $("#filler").height($("#mainNav").height());
    $('footer').hide();
    $(window).resize(function () {
        $("#messageSend").width($("#message-feed").width());
    });
});

$(function () {
    // var app = angular.module('sockchat', []);
    var socket = io.connect();
    var $message = $("#msgTextBox");
    var $chat = $("#inbox-messages");
    //onload init
    socket.emit('connected', {
        username: myuser,
        hash: userhash
    }, function (data) {
        if (data) {
            $("#userFormArea").fadeOut();
            $("#postLogin").fadeIn();

        }
    });

    socket.on('post connect', function (data) {
        console.log('post connect:', data);
        // var html = '<p class="panel-heading">Active users</p >';

        // removeDup(data).forEach(function (singleuser) {
        //     html += '<a class="panel-block"><i class="fa fa-user"></i>&nbsp;' + singleuser + '</a >';
        // });
        // $("#activeUserpanel").html(html);
        socket.emit('room add', {
            roomname: 'test',
            password: 'tam'
        }, function (data) {
            console.log("room add:", data);
            // if (data) {
            //     $("#userFormArea").fadeOut();
            //     $("#postLogin").fadeIn();

            // }
        });

    });
    socket.on('post room add', function (data) {
        console.log('post room add:', data);
    });

    $("#message-feed").animate({
        scrollTop: $('#message-feed').prop("scrollHeight")
    }, 500);

    $("#msgSendBtn").click(function (e) {
        e.preventDefault();
        if ($message.val() == '')
            return;
        console.log("send msg trig");
        console.log("sending from:", rooms[0].roomname);
        socket.emit('send message', {
            message: $message.val(),
            room: rooms[0].roomname
        }); //redo
        $message.val('');
    });
    $("#msgTextBox").on('keyup', function (e) {
        if (e.keyCode == 13) {
            $("#msgSendBtn").trigger("click");
        }
    });
    // app.controller('msgController', function () {
    //     this.review = {};
    //     this.messages = messages;
    //     this.own = function (username) {
    //         return (username == myuser);
    //     };
    socket.on('new message', function (data) {
        console.log('new msg:', data);
        messages.push(data);
        // this.messages.push(data);
        // var col = 'is-primary';
        // if (data.user == myuser)
        //     col = 'mymsg';
        // $chat.append('<div class="box ' + col + '"><article class="media"><div class="media-content"><div class="content"><p><strong> ' + data.user + '</strong><small>@' + data.user + '</small><small></small><br>' + data.msg + '</p></div></div></article></div>');
        keepAtBottom();
    });
    // });

});

function keepAtBottom() {
    $("#message-feed").animate({
        scrollTop: $('#message-feed').prop("scrollHeight")
    }, 500);
}
//lets send all chat data using js. forget ejs rendering (for a while) for messages etc?
// decide connected vs rendered? Id go with rendered. Faster. then what do i return when