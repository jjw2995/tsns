const { AuthService } = require('../services')
/*
 * call other imported services, or same service but different functions here if you need to
 */

const postRegister = (req, res) => {
	AuthService
		.registerUser(req.body)
		.then((newUser) => res.status(200).json(newUser))
		.catch((e) => {
			// console.log(e);
			res.status(400).json(e.message)
		})
}

const postLogin = (req, res) => {
	AuthService
		.loginUser(req.body)
		.then((user) => {
			res.status(200).json(user)
		})
		.catch((e) => {
			res.status(400).json(e)
		})
}

const postLogout = (req, res) => {
	AuthService
		.logoutUser(req.user)
		.then((user) => res.status(200).send('sucessfully logged out'))
		.catch((e) => res.status(400).json(e))
}

const postToken = (req, res) => {
	// console.log(req.user);
	AuthService
		.newAccTokenUser(req.user)
		.then((token) => {
			// console.log('\n', token, '\n');
			res.status(200).json(token)
		})
		.catch((e) => res.status(400).json(e))
}

//=======================================================
//=======================================================
//=======================================================
const User = require('mongoose').model('User')
const getRegister = (req, res) => {
	User.deleteMany({}, (err, output) => {
		if (err) {
			console.log(err)
		} else {
			res.json(output)
		}
	})
}

module.exports = {
	postRegister,
	postLogin,
	getRegister,
	postLogout,
	postToken,
}
