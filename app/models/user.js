/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
const mongoose = require('mongoose');
require('mongoose-type-url');
const bcrypt = require('bcrypt');
const Email = require('mongoose-type-mail');
const timestamps = require('mongoose-timestamp');
const SALT_WORK_FACTOR = 10;

const schema = new mongoose.Schema(
	{
		social_id: { type: String },
		password: { type: String, trim: true },
		is_fb_auth: { type: Boolean, default: false },
		is_google_auth: { type: Boolean, default: false },
		username: { type: String, trim: true, required: true, unique: true },
		email: { type: Email, index: { unique: true }, trim: true }
	},
	{ collection: 'users' }
);

schema.index({ email: 1 }, { unique: true }); // schema level

//The User model will now have createdAt and updatedAt properties, which get automatically generated and updated when you save your document.
schema.plugin(timestamps);

/**
 * checkValidPassword user with given information
 * @param email
 * @param password
 */
schema.statics.checkValidPassword = async function(email, password) {
	return new Promise(async (resolve, reject) => {
		let user = await this.find({ email: email }).exec();
		if (user.length == 0) return reject('user does not exist');
		const doesMatch = await bcrypt.compare(password, user[0].password);
		if (doesMatch) return resolve(user[0]['_id']);
		return reject('Invalid Password');
	});
};

schema.pre('save', function(next) {
	let user = this;

	if (user.is_google_auth || user.is_fb_auth) {
		next(null);
	} else {
		// generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if (err) return reject(err);
			// hash the password along with our new salt
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) next(err);
				// return resolve(hash);
				user.password = hash;
				next(null);
			});
		});
	}
});

schema.statics.encryptPassword = async (password) => {};

const User = mongoose.model('User', schema);
module.exports = User;
