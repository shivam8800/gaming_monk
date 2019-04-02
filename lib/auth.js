/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
const redisClient = require('./redis');
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
		} catch (e) {
			console.log(e);
			throw e;
		}
	},
	name: 'auth',
	version: require('../package.json').version
};
