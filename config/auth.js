module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
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