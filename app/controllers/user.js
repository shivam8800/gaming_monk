/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
//validation
const validators = require('../validators/user_and_company');
//middleware
const middleware = require('../middlewares/user');
//handler
const Handlers = require('../handlers/user_handler');

exports.login_page = {
	tags: [ 'api' ],
	notes: 'LogIn Page',
	description: 'LogIn Page',
	handler: async (request, h) => {
		return h.view('login', { title: 'LogIn' });
	}
};

exports.home = {
	tags: [ 'api' ],
	notes: 'home Page',
	description: 'home Page',
	handler: async (request, h) => {
		return h.view('home', { title: 'welcome to Home Page' });
	}
};

exports.index = {
	auth: 'jwt',
	tags: [ 'api' ],
	notes: 'index Page',
	description: 'index Page',
	handler: async (request, h) => {
		return h.view('home', { title: 'welcome to INDEX Page, Successfully loged in' });
	}
};

exports.signup_page = {
	tags: [ 'api' ],
	notes: 'SignUp Page',
	description: 'SignUp Page',
	handler: async (request, h) => {
		return h.view('signup', { title: 'SignUp' });
	}
};

exports.signup = {
	tags: [ 'api' ],
	notes: 'Sign up',
	validate: {
		payload: validators.signup
	},
	pre: [ { method: middleware.checkEmailExistance, assign: 'User' } ],
	handler: Handlers.signup
};

exports.login = {
	tags: [ 'api' ],
	notes: 'Log In',
	validate: {
		payload: validators.login
	},
	handler: Handlers.login
};

exports.logout = {
	auth: 'jwt',
	tags: [ 'api' ],
	notes: 'Log Out',
	handler: Handlers.logout
};

exports.google_auth = {
	auth: {
		strategy: 'google',
		mode: 'try'
	},
	tags: [ 'api' ],
	notes: 'Log Out',
	handler: Handlers.google_login
};

exports.facebook_auth = {
	auth: {
		strategy: 'facebook',
		mode: 'try'
	},
	tags: [ 'api' ],
	notes: 'Log Out',
	handler: Handlers.facebook_login
};
