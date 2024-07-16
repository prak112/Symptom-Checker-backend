const express = require('express')
const router = express.Router()
const symptomCheckerController = require('../controllers/symptomChecker')

// 'Specific' search result
router.post('/specific', symptomCheckerController.getSpecificDiagnosis)
// 'General' search result
router.post('/general', symptomCheckerController.getGeneralDiagnosis)

module.exports = router