const express = require('express')
const router = express.Router()
const middleware = require('../utils/middleware')
const symptomCheckerController = require('../controllers/business/symptomChecker')

/**
 * Authentication middleware verifies the user by the JWT in the Cookie header and approves or denies the service request
 */
// 'General' search
router.post('/general', middleware.userExtractor, symptomCheckerController.getGeneralDiagnosis)

// 'Specific' search
router.post('/specific', middleware.userExtractor, symptomCheckerController.getSpecificDiagnosis)

// export to app
module.exports = router