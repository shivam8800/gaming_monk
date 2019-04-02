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
				return resolve(h.response({ status: 'ok', _id: doc._id }).code(201));
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
		console.log(session);
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
