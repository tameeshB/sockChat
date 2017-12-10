module.exports = {

    'facebookAuth' : {
        'clientID'      : '811912619017519', // your App ID
        'clientSecret'  : '', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name']
    },

    'twitterAuth' : {
		'consumerKey'       : '',
		'consumerSecret'    : '',
		'callbackURL'       : ''
    },

    'googleAuth' : {
		'clientID'      : '',
		'clientSecret'  : '',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
