// utility functions
const requestHelper = require('../utils/requestBuilder')
const searchHelper = require('../utils/lookupSearchData')
const dataProcessor = require('../utils/refineQueryResults')
const symptomsProcessor = require('../utils/searchSymptoms')
// database controller
const dataController = require('../../database/controllers/userData')


// POST - 'General' search result from symptoms list
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        // sample - ['knee joint pain', 'spinal cord pain', 'shoulder pain', 'cough', 'fever']
        const symptoms =  request.body.symptoms
        const analysisType = request.body.analysis
        console.log('Request Body : ', request.body)
        console.log('SEARCH Query for : ', symptoms);
        console.log('Analysis type : ', analysisType)
        
        // setup API auth for search query
        // const requestOptions = await requestHelper.buildRequestOptions(request, 'POST');
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/search'

        const diagnosisDataArray = []

        if (analysisType.includes("panel")) {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptomString)
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType.includes("assessment")) {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptom)
                diagnosisDataArray.push({
                    symptom: symptom,
                    analysis: analysisType,
                    ...diagnosisData
                })
            }
        }

        // store registered/guest user data
        console.log('\nStoring user data...')
        const user = request.user
        const dbResponse = dataController.manageDatabase(user, diagnosisDataArray)
        if (dbResponse) {
            response
                .status(200)
                .json(diagnosisDataArray)
        } else {
            response
                .status(500)
                .json({ error: 'Failed to store data!' })
        }
    } 
    catch(error) {
        console.error('ERROR during General search : ', error)
        next(error)
    }
}

// POST - 'Specific' search result from symptoms list
exports.getSpecificDiagnosis = async(request, response) => {
    try {
        // retrieve symptoms
        // sample - ['knee joint pain', 'spinal cord pain', 'shoulder pain', 'cough', 'fever']
        const symptoms =  request.body.symptoms
        const analysisType = request.body.analysis
        console.log('Request Body : ', request.body)
        console.log('\nSEARCH Query for : ', symptoms);
        console.log('Analysis type : ', analysisType)

        // access middleware to authenticate access
        // const requestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        // API search endpoint
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'

        const diagnosisDataArray = []

        if (analysisType.includes("panel")) {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptomString)
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType.includes("assessment")) {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptom)
                diagnosisDataArray.push({
                    symptom: symptom,
                    analysis: analysisType,
                    ...diagnosisData
                })
            }
        }

        // store registered/guest user data
        console.log('\nStoring user data...')
        const user = request.user
        const dbResponse = dataController.manageDatabase(user, diagnosisDataArray)
        if (dbResponse) {
            response
                .status(200)
                .json(diagnosisDataArray)
        } else {
            response
                .status(500)
                .json({ error: 'Failed to store data!' })
        }
    } 
    catch(error) {
        console.error('ERROR during Specific search : ', error)
    }
}