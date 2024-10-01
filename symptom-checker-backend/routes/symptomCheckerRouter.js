const express = require('express')
const router = express.Router()
const middleware = require('../utils/middleware')
const symptomCheckerController = require('../controllers/business/symptomChecker')

// 'General' search result
router.post('/general', middleware.userExtractor, symptomCheckerController.getGeneralDiagnosis)
// 'Specific' search result
router.post('/specific', middleware.userExtractor, symptomCheckerController.getSpecificDiagnosis)

// export to app
module.exports = router