const express = require('express')
const router = express.Router()
const middleware = require('../utils/middleware')
const symptomCheckerController = require('../controllers/symptomChecker/symptomChecker')

// 'General' search result
router.post('/general', middleware.userExtractor, symptomCheckerController.getGeneralDiagnosis)
// 'Specific' search result
router.post('/specific', middleware.userExtractor, symptomCheckerController.getSpecificDiagnosis)


module.exports = router