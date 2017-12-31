var mongojs = require('mongojs');
var db = mongojs('sockchat', ['messages','users','rooms']);
var http = require('http');
var querystring = require('querystring');

var confirm = require('confirm-cli');
/** 
  * testing script for dev.
  * run using "node config/init.js"
  **/

// confirm('Confirm remove all data?',
//     function () {
//         db.users.remove({}, (err, dat) => { db.rooms.remove({}, (err, dat) => { db.messages.remove({},(err,dat)=>{
//             console.log('removed');
           
//         });});});

db.users.remove({});
db.messages.remove({});
db.rooms.remove({});
      
//         createNewUser('Test Boi', 'testBoi', 'test@tameesh.in');
//         createNewUser('Test More', 'testBitMore', 'test2@tameesh.in');
//         createNewUser('Cool Boi', 'coolboi', 'coolboi@tameesh.in');
//         createNewUser('Cool Boi', 'coolboi', 'coolboi@tameesh.in', 1);
//     }, function () {
//         process.exit();
//     });

createNewUser('Tameesh Biswas', 'tameeshb', 'me@tameesh.in');
createNewUser('Test More', 'testBitMore', 'test2@tameesh.in');
createNewUser('Cool Boi', 'coolboi', 'coolboi@tameesh.in');
createNewUser('Cooler Boi', 'coolerboi', 'coolerboi@tameesh.in', 1);

function createNewUser(name, uname, email,last){
    var post_data = querystring.stringify({
        'name': name,
        'uname': uname,
        'email': email,
        'password': 'tam',
        'password_': 'tam'
    });
    var post_options = {
        host: 'localhost',
        port: '3000',
        path: '/api/register/web',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
    // if (last == 1)
        // process.exit();
}
