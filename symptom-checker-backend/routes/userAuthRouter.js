const router = require('express').Router()
const signUpController = require('../controllers/auth/signup')
const loginController = require('../controllers/auth/login')

// Signup route
router.post('/signup', signUpController.registerUser)

// Login route
router.post('/login', loginController.authenticateUser)

module.exports = router