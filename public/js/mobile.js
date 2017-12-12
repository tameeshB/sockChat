if($(window).width()<900){
    var g_state=0;
    $("#makeVisible").hide();
    $("#conv-list a").click(function(){
        $("#conv-list").fadeOut();
        $("#message-feed").fadeIn();
        // $("#infoBthMob").fadeIn(); 
        g_state =1;
    });

    $("*").click(function(){
        if(g_state==1){
            $("#makeVisible").fadeIn();
        }
        if(g_state!=0){
            $("#backBthMob").fadeIn();
        }else{
            $("#backBthMob").fadeOut();
        }
        if (g_state == 1) {
            $("#infoBthMob").fadeIn();
        } else {
            $("#infoBthMob").fadeOut();
        }

    });

    $("#backBthMob").click(function(){
        if(g_state==1){
            $("#message-feed").fadeOut("fast",function(){
                $("#conv-list").fadeIn();
            });
            g_state = 0;
        } else if(g_state==2){
            $("#feed-info").fadeOut("fast", function () {
                $("#message-feed").fadeIn();
            });
            g_state = 1;
        }
    });

    $("#infoBthMob").click(function(){
        g_state = 2;
        $("#conv-list").fadeOut();
        $("#message-feed").fadeOut();
        $("#feed-info").fadeIn();

    })

}