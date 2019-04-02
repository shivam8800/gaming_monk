//model
const User = require('../models/user');
//helper
const errorHelper = require('../helpers/error-helper');

//dependencies
const Boom = require('boom');

exports.checkEmailExistance = async (request, h) => {
	try {
		console.log('in email check');
		const conditions = {
			email: request.payload.email
		};

		let user = await User.findOne(conditions);
		if (user) {
			throw Boom.conflict('Email already in use.');
		}

		return true;
	} catch (err) {
		errorHelper.handleError(err);
	}
};
