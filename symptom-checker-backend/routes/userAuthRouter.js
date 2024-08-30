const router = require('express').Router()
const signUpController = require('../controllers/auth/user/signup')
const loginController = require('../controllers/auth/user/login')
const guestController = require('../controllers/auth/user/guest')

// Signup route
router.post('/signup', signUpController.registerUser)

// Login route
router.post('/login', loginController.authenticateUser)

// Guest setup route
router.post('/guest', guestController.createGuestUser)

module.exports = router