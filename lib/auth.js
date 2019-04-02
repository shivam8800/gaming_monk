/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
const redisClient = require('./redis');
require('dotenv').config();

exports.plugin = {
	async register(server, options) {
		try {
			// validation function
			const validate = async (user, decoded, request) => {
				return new Promise((resolve, reject) => {
					// checks to see if the person is valid
					if (!user) {
						return resolve({ isValid: false });
					} else {
						redisClient.hget('blacklistedTokens', decoded.auth.token, function(err, data) {
							if (data) {
								return resolve({ isValid: false });
							} else {
								return resolve({ isValid: true });
							}
						});
					}
				});
			};
			//normal jwt authentication plugin
			await server.register(require('hapi-auth-jwt2'));

			server.auth.strategy('jwt', 'jwt', {
				key: process.env.SECRET_KEY,
				validate: validate,
				verifyOptions: { algorithms: [ 'HS256' ] }
			});

			//registring bell for linkdin authentication plugin
			await server.register(require('bell'));

			server.auth.strategy('google', 'bell', {
				provider: 'google',
				password: process.env.COOKIE_ENCRYPTION_PASSWORD_SECURE,
				isSecure: false,
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_SECRET_ID,
				location: 'http://localhost:3009'
			});
		} catch (e) {
			console.log(e);
			throw e;
		}
	},
	name: 'auth',
	version: require('../package.json').version
};
