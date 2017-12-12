function removeDup(arr) {
    let unique_array = Array.from(new Set(arr))
    return unique_array
}
$(document).ready(function() {
    $("#messageSend").width($("#message-feed").width());
    if ($(window).width() >= 900)
        $("#makeVisible").delay(100).fadeIn();
    $("#filler").height($("#mainNav").height());
    $('footer').hide();
});

$(function() {
    var socket = io.connect();
    var $message = $("#msgTextBox");
    var $chat = $("#inbox-messages");
    var myuser = "";
    //onload init
    myuser = '<%= user.username %>';
    socket.emit('new user', myuser, function(data) {
        if (data) {
            $("#userFormArea").fadeOut();
            $("#postLogin").fadeIn();
        }
    });
    socket.on('get users', function(data) {
        var html = '<p class="panel-heading">Active users</p >';

        removeDup(data).forEach(function(singleuser) {
            html += '<a class="panel-block"><i class="fa fa-user"></i>&nbsp;' + singleuser + '</a >';
        });
        $("#activeUserpanel").html(html);
    });
    $("#message-feed").animate({
        scrollTop: $('#message-feed').prop("scrollHeight")
    }, 500);
    $("#msgSendBtn").click(function(e) {
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val('');
    });
    $("#msgTextBox").on('keyup', function(e) {
        console.log('enter trig');
        if (e.keyCode == 13) {
            console.log('hmm');
            $("#msgSendBtn").trigger("click");
        }
    });
    socket.on('new message', function(data) {
        var col = 'is-primary';
        if (data.user == myuser)
            col = 'mymsg';
        $chat.append('<div class="box ' + col + '"><article class="media"><div class="media-content"><div class="content"><p><strong> ' + data.user + '</strong><small>@' + data.user + '</small><small></small><br>' + data.msg + '</p></div></div></article></div>');
        $("#message-feed").animate({
            scrollTop: $('#message-feed').prop("scrollHeight")
        }, 500);
    });
});