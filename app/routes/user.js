/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
exports.plugin = {
	async register(server, options) {
		const Controllers = {
			user: {
				user: require('../controllers/user')
			}
		};
		server.route([
			{
				method: 'GET',
				path: '/home',
				options: Controllers.user.user.home
			},
			{
				method: 'GET',
				path: '/login',
				options: Controllers.user.user.login_page
			},
			{
				method: 'GET',
				path: '/signup',
				options: Controllers.user.user.signup_page
			},
			{
				method: 'POST',
				path: '/signup',
				options: Controllers.user.user.signup
			},
			{
				method: 'POST',
				path: '/login',
				options: Controllers.user.user.login
			},
			{
				method: 'POST',
				path: '/logout',
				options: Controllers.user.user.logout
			},
			{
				method: 'GET',
				path: '/google/auth',
				options: Controllers.user.user.google_auth
			},
			{
				method: 'GET',
				path: '/facebook/auth',
				options: Controllers.user.user.facebook_auth
			}
		]);
	},
	version: require('../../package.json').version,
	name: 'user-route'
};
