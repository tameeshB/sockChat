//dependencies
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
//local
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.username = req.body.uname;
                newUser.name = req.body.name;

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    req.flash('loginMessage', 'You are registered! Login here to continue!');
                    return done(null, newUser);
                });
            }

        });    

        });

    }));


    //local login
    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password.')); 
                console.log('login successful');
                console.log(user);
                console.log(req.user);
                console.log('login successful1.5');
                
                req.user = user;
                var ssn = req.session;
                ssn.user = user;
                console.log(req.session.user);
                console.log('login successful2');
               return done(null, user);

            });

        }));




    // facebook
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL

    },
        function (token, refreshToken, profile, done) {
            process.nextTick(function () {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        //login
                        var ssn = req.session;
                        ssn.user = user;
                        return done(null, user); 
                    } else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            var ssn = req.session;
                            ssn.user = newUser;
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

};
