const router = require('express').Router()
const guestController = require('../controllers/auth/user/guest')
const signUpController = require('../controllers/auth/user/signup')
const loginController = require('../controllers/auth/user/login')
const logoutController = require('../controllers/auth/user/logout')

// Guest setup route
router.post('/guest', guestController.createGuestUser)

// Signup route
router.post('/signup', signUpController.registerUser)

// Login route
router.post('/login', loginController.authenticateUser)

// Logout route - To Be Implemented
router.post('/logout', logoutController.clearUserSession)


module.exports = router