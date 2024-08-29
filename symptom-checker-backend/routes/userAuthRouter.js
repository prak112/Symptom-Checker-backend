const router = require('express').Router()
const signUpController = require('../controllers/auth/user/signup')
const loginController = require('../controllers/auth/user/login')

// Signup route
router.post('/signup', signUpController.registerUser)

// Login route
router.post('/login', loginController.authenticateUser)

module.exports = router