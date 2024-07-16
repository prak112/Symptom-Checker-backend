const express = require('express')
const router = express.Router()
const symptomCheckerController = require('../controllers/symptomChecker')

router.post('/symptoms', symptomCheckerController.getDiagnosis)


module.exports = router