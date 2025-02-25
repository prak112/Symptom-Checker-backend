// utility functions
const requestHelper = require('../utils/requestBuilder')
const searchHelper = require('../utils/lookupSearchData')
const dataProcessor = require('../utils/refineQueryResults')
const symptomsProcessor = require('../utils/searchSymptoms')
// database controller
const dataController = require('../../database/controllers/userData')


/**
 * Request type - POST
 * 'General' search result from symptoms list
 * Example symptoms - ['knee joint pain', 'spinal cord pain', 'shoulder pain', 'cough', 'fever'] 
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // TODO - Decrypt frontend request parameters, i.e., symptoms, analysis
        const symptoms =  request.body.symptoms
        const analysisType = request.body.analysis
        console.log('Request Body : ', request.body)
        console.log('SEARCH Query for : ', symptoms);
        console.log('Analysis type : ', analysisType)
        
        // ICD API search endpoint
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/search'

        const diagnosisDataArray = []

        if (analysisType.includes("panel")) {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptomString)
            
            // TODO - Encrypt processed data, i.e., diagnosisData
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType.includes("assessment")) {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptom)

            // TODO - Encrypt processed data, i.e., diagnosisData
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
        
        // TODO - Pass encrypted diagnosisData to database
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

/**
 * Request type - POST
 * 'Specific' search result from symptoms list
 * Example symptoms - ['knee joint pain', 'spinal cord pain', 'shoulder pain', 'cough', 'fever']
 * @param {*} request 
 * @param {*} response 
 */
exports.getSpecificDiagnosis = async(request, response, next) => {
    try {
        // TODO - Decrypt frontend request parameters, i.e., symptoms, analysis
        const symptoms =  request.body.symptoms
        const analysisType = request.body.analysis
        console.log('Request Body : ', request.body)
        console.log('\nSEARCH Query for : ', symptoms);
        console.log('Analysis type : ', analysisType)

        // ICD API search endpoint
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'

        const diagnosisDataArray = []

        if (analysisType.includes("panel")) {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptomString)

            // TODO - Encrypt processed data, i.e., diagnosisData
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType.includes("assessment")) {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptom)

            // TODO - Encrypt processed data, i.e., diagnosisData
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
    
        // TODO - Pass encrypted diagnosisData to database and frontend
        const dbResponse = dataController.manageDatabase(user, diagnosisDataArray)
        if (!dbResponse) {
            return response
            .status(500)
            .json({ error: 'Failed to store data!' })
        }
        return response
            .status(200)
            .json(diagnosisDataArray)
    } 
    catch(error) {
        console.error('ERROR during Specific search : ', error)
        next(error)
    }
}