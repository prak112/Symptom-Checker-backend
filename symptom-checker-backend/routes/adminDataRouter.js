const express = require('express')
const router = express.Router()
const middleware = require('../utils/middleware')
const adminDataController = require('../database/controllers/adminData')

// GET all users
router.get('/users', middleware.userExtractor, adminDataController.getAllUsers)

// export to app
module.exports = router