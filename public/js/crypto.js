$(document).ready(function(){
    
    createRandomString(a => console.log(a),5);
    // var sjcl = require('./sjcl.js')
    if (typeof (Storage) !== "undefined") {
    } else {
        window.location = '/incompat/localStorage';
    }
    // sjcl.encrypt("password", "data")
    // to encrypt data, or
    // sjcl.decrypt("password", "encrypted-data")
    if(localStorage.getItem('sockchat')){

    }else{
        // var pair = sjcl.ecc.elGamal.generateKeys(256);

        $.ajax({
            method: "POST",
            // url: "/crypto/getNewClientID",
            url: "/crypto/init",
            data:{
                username:myuser,
                rooms: []
            },
            beforeSend: (xhr) => {
                xhr.setRequestHeader('Accept', 'application/json');
            }
        }).done(function (data) {
            if(data.status==401)
                window.location = '/incompat/clientIDErr';
            return;
            localStorage.setItem('sockchatPrivKey' + myuser, pair.sec);
            localStorage.setItem('sockchatClientID' + myuser, data.cid);
                
        });
    }
});