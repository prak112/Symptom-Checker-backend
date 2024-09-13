const express = require('express')
const router = express.Router()
const userHistoryController = require('../database/controllers/userHistory')
const middleware = require('../utils/middleware')

// GET all diagnosis
router.get('/history', middleware.userExtractor, userHistoryController.getAllDiagnosis)


// export to app
module.exports = router