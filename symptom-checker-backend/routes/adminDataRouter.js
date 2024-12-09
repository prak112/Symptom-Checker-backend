const express = require('express')
const router = express.Router()
const middleware = require('../utils/middleware')
const adminDataController = require('../database/controllers/adminData')

// GET all users
router.get('/users', middleware.userExtractor, adminDataController.getAllUsers)

// GET all diagnosis
router.get('/diagnosis', middleware.userExtractor, adminDataController.getAllDiagnosis)

// export to app
module.exports = router