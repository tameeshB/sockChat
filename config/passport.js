//dependencies
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function (passport, app) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    //local
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
                User.findOne({
                    $or: [
                    { 'local.email': email },
                    { 'username': req.body.uname }
                    ]
                }, function (err, user) {
                    if (err)
                        return done(err);
                        //check dupes
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email/username is already taken.'));
                    } else {
                        var newUser = new User();

                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.hash = newUser.generateAccessHash(req.body.uname, password);
                        newUser.username = req.body.uname;
                        newUser.name = req.body.name;

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            app.mailer.send('email', {
                                to: 'gmail@gmail.com',
                                subject: 'New SignUp :' + email + ' : ' + req.body.uname,
                            }, function (err) {
                                if (err) {
                                    // handle error 
                                    console.log(err);
                                    req.flash('emailMsg', 'There was an error sending the email');
                                    return;
                                }
                                req.flash('emailMsg', 'Email Sent');
                            });
                            req.flash('loginMessage', 'You are registered! Login here to continue!');
                            
                            return done(null, newUser);
                        });
                    }

                });

            });

        }));


    //local login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            User.findOne({
                'local.email': email
            }, function (err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password.'));
                var ssn = req.session;
                if (user.rooms){
                    ssn.rooms = user.rooms;
                    roomsGL_id = user.rooms;
                    userGL = user;
                }
                else{
                    ssn.rooms = [];
                    roomsGL_id = {};
                    userGL = user;
                }
                req.user = user;
                ssn.user = user;
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
                User.findOne({
                    'facebook.id': profile.id
                }, function (err, user) {
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
