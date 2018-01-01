$(document).ready(function(){
   
    if (typeof (Storage) !== "undefined") {
    } else {
        window.location = '/incompat/localStorage'
    }

    if(localStorage.getItem('sockchatPrivKey'+myuser)){

    }else{
        var pair = sjcl.ecc.elGamal.generateKeys(256);
        $.ajax({
            method: "POST",
            url: "/crypto/getNewClientID",
            data:{
                username:myuser,
                pubKey: pair.pub
            }
        }).done(function (data) {
            localStorage.setItem('sockchatPrivKey' + myuser, pair.sec);
            localStorage.setItem('sockchatClientID' + myuser, data);
                
        });
    }
});