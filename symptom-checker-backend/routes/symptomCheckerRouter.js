const express = require('express')
const router = express.Router()
const symptomCheckerController = require('../controllers/symptomChecker/symptomChecker')

// 'General' search result
router.post('/general', symptomCheckerController.getGeneralDiagnosis)
// 'Specific' search result
router.post('/specific', symptomCheckerController.getSpecificDiagnosis)


module.exports = router