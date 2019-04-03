//model
const User = require('../models/user');
//dependencies
const Boom = require('boom');
const JWT = require('jsonwebtoken');
//lib
const redisClient = require('../../lib/redis');
//env
require('dotenv').config();

exports.login = async (request, h) => {
	return new Promise((resolve, reject) => {
		User.checkValidPassword(request.payload.email, request.payload.password)
			.then((result) => {
				const token = JWT.sign(
					{ exp: Math.floor(Date.now() / 1000) + 604800, data: result.toJSON() },
					process.env.SECRET_KEY
				);
				return resolve(h.response({ token: token, user_id: result }).code(201));
			})
			.catch((error) => {
				return reject(Boom.badGateway(error));
			});
	});
};

exports.signup = async (request, h) => {
	let pr = async (resolve, reject) => {
		let new_user_object = {
			username: request.payload.username,
			email: request.payload.email,
			password: request.payload.password
		};
		let new_user = new User(new_user_object);
		new_user.save(async function(er, doc) {
			if (er) {
				return reject(Boom.forbidden(er));
			} else {
				return resolve(h.response({ status: 'ok', user_id: doc._id }).code(201));
			}
		});
	};
	return new Promise(pr);
};

exports.logout = async (request, h) => {
	let pr = (resolve, reject) => {
		let session = {
			id: request.auth.token // a random session id
		};

		const expiredTime = new Date(request.auth.credentials.exp * 1000);
		const today = new Date();
		let seconds = parseInt(Math.abs(expiredTime - today) / 1000);

		redisClient.hset('blacklistedTokens', request.auth.token, JSON.stringify(session), 'EX', seconds, function(
			err,
			data
		) {
			if (!err) {
				return resolve(h.response({ message: 'You are cool !' }).code(205));
			} else {
				return reject(Boom.badGateway(err));
			}
		});
	};
	return new Promise(pr);
};

exports.google_login = async (request, h) => {
	return new Promise((resolve, reject) => {
		console.log(request.auth, 'request.auth');
		if (!request.auth.isAuthenticated) return reject(Boom.unauthorized('Authentication Failed'));
		let userObject = {},
			findCond = {};
		userObject.is_google_auth = true;
		userObject.social_id = request.auth.credentials.profile.id;
		userObject.username = request.auth.credentials.profile.displayName;

		if (request.auth.credentials.profile.email) userObject.email = request.auth.credentials.profile.email;

		findCond = { username: userObject.username };

		User.findOne(findCond, async function(err, data) {
			if (err) {
				return reject(Boom.badImplementation(err));
			} else if (data) {
				await User.findOneAndUpdate(findCond, { $set: userObject });
				const token = JWT.sign(
					{ exp: Math.floor(Date.now() / 1000) + 604800, data: data['_id'].toJSON() },
					process.env.SECRET_KEY
				);
				console.log(data, 'ho gya login');
				return resolve(h.response({ token: token, user_id: data['_id'] }).code(201));
			} else {
				let new_user = new User(userObject);
				new_user.save(function(e, d) {
					console.log(e, 'eee');
					if (e) {
						return reject(Boom.badImplementation(err));
					} else {
						const token = JWT.sign(
							{ exp: Math.floor(Date.now() / 1000) + 604800, data: d['_id'].toJSON() },
							process.env.SECRET_KEY
						);
						return resolve(h.response({ token: token, user_id: d['_id'] }).code(201));
					}
				});
			}
		});
	});
};
exports.facebook_login = async (request, h) => {
	return new Promise((resolve, reject) => {
		console.log(request.auth, 'request.auth');
		if (!request.auth.isAuthenticated) return reject(Boom.unauthorized('Authentication Failed'));

		let userObject = {},
			findCond = {};

		userObject.is_fb_auth = true;
		userObject.social_id = request.auth.credentials.profile.id;
		userObject.username = request.auth.credentials.profile.displayName;

		if (request.auth.credentials.profile.email) userObject.email = request.auth.credentials.profile.email;

		findCond = { username: userObject.username };

		User.findOne(findCond, async function(err, data) {
			if (err) {
				return reject(Boom.badImplementation(err));
			} else if (data) {
				await User.findOneAndUpdate(findCond, { $set: userObject });
				const token = JWT.sign(
					{ exp: Math.floor(Date.now() / 1000) + 604800, data: data['_id'].toJSON() },
					process.env.SECRET_KEY
				);
				return resolve(h.response({ token: token, user_id: data['_id'] }).code(201));
			} else {
				let new_user = new User(userObject);
				new_user.save(function(e, d) {
					console.log(e, 'eee');
					if (e) {
						return reject(Boom.badImplementation(err));
					} else {
						const token = JWT.sign(
							{ exp: Math.floor(Date.now() / 1000) + 604800, data: d['_id'].toJSON() },
							process.env.SECRET_KEY
						);
						return resolve(h.response({ token: token, user_id: d['_id'] }).code(201));
					}
				});
			}
		});
	});
};
