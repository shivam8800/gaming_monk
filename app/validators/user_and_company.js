/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
module.exports = {
	signup: Joi.object().keys({
		username: Joi.string().min(2).max(50).required().trim().description('user name'),
		email: Joi.string().email().required().trim().description('Email Id'),
		password: Joi.string().required().trim().description('password given by user')
	}),
	login: Joi.object().keys({
		email: Joi.string().email().required().trim().description('Email address of Account'),
		password: Joi.string().required().trim().description('Password')
	})
};
