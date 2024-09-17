// utility functions
const requestHelper = require('../utils/requestBuilder')
const searchHelper = require('../utils/lookupSearchData')
const dataProcessor = require('../utils/refineQueryResults')
const symptomsProcessor = require('../utils/searchSymptoms')
// database controller
const dataController = require('../../database/controllers/data')


// POST - 'General' search result from symptoms list
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        // sample - ['knee joint pain', 'spinal cord pain', 'shoulder pain', 'cough', 'fever']
        const symptoms =  request.body.symptoms
        const analysisType = request.body.analysis
        console.log('Request Body : ', request.body)
        console.log('\nSEARCH Query for : ', symptoms);
        console.log('Analysis type : ', analysisType)
        
        // setup API auth for search query
        // const requestOptions = await requestHelper.buildRequestOptions(request, 'POST');
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/search'

        const diagnosisDataArray = []

        if (analysisType === "panel") {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptomString)
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType === "assessment") {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateGeneralDiagnosis(request, searchUrl, symptom)
                diagnosisDataArray.push({
                    symptom: symptom,
                    analysis: analysisType,
                    ...diagnosisData
                })
            }
        }

        // for (let symptom of symptoms) {

            // // intialize arrays for diagnosis data
            // let labelsArray = []
            // let scoresArray = []
            // let foundationUrisArray = []
            // // General search - /icd/release/11/2024-01/mms/search
            // const searchParams = {
            //     q: symptom,
            //     subtreeFilterUsesFoundationDescendants: false,
            //     includeKeywordResult: true,
            //     useFlexisearch: true,
            //     flatResults: true,
            //     highlightingEnabled: true,
            //     medicalCodingMode: true 
            // }
            
            // // construct query string for URI
            // const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
            // const searchResponse = await fetch(searchEndpoint, requestOptions)
            // console.log(`\nSEARCH ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`)
    
            // // extract data from search results
            // const searchData = await searchResponse.json()
    
            // // General search results - /icd/release/11/{releasId}/{linearizationName}/search
            // // Data crawl map : destinationEntities--> MatchingPVs--> label, score, foundationUri
            // for(let entity of searchData.destinationEntities) {
            //     if(entity.matchingPVs && Array.isArray(entity.matchingPVs)) {
            //         for(let pv of entity.matchingPVs) {
            //             // avoid duplicate data in searchQueryOutput
            //             if(foundationUrisArray.includes(pv.foundationUri)) {
            //                 break
            //             }
            //             else {
            //                 labelsArray.push(pv.label);
            //                 scoresArray.push(pv.score);
            //                 foundationUrisArray.push(pv.foundationUri);
            //                 //console.log('URI #',uriCount,' : ', pv.foundationUri);                        
            //             }
            //         }
            //     }
            // }
            // console.log(`SEARCH data AFTER filtering Duplicates (foundationUri) :
            //     LABELS: ${labelsArray.length}
            //     SCORES: ${scoresArray.length}
            // `)
    
            // // Handle ICD API Buggy URI (Debug_Log issue 2)
            // const cleanedUrisArray = dataProcessor.sanitizeUrisArray(foundationUrisArray)
    
            // // pack search data for LookUp query
            // const searchQueryOutput = {
            //     label: labelsArray,
            //     score: scoresArray,
            //     foundationURI: cleanedUrisArray,
            // }
    
            // // lookup foundationURI
            // const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
            // const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);
            // pack diagnosis for user-provided symptom
            // diagnosisDataArray.push({
            //     symptom: symptom,
            //     ...diagnosisData
            // })
        // }

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

        if (analysisType === "panel") {
            const symptomString = symptoms.toString()
            const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptomString)
            diagnosisDataArray.push({
                symptom: symptomString,
                analysis: analysisType,
                ...diagnosisData
            })
        }
        if (analysisType === "assessment") {
            for (let symptom of symptoms) {
                const diagnosisData = await symptomsProcessor.generateSpecificDiagnosis(request, searchUrl, symptom)
                diagnosisDataArray.push({
                    symptom: symptom,
                    analysis: analysisType,
                    ...diagnosisData
                })
            }
        }

        // for (let symptom of symptoms) {
        //     // intialize arrays for diagnosis data
        //     let labelsArray = []
        //     let scoresArray = []
        //     let foundationUrisArray = []

        //     // Specific search result - /icd/release/11/2024-01/mms/autocode
        //     const searchParams = {
        //         searchText: symptom
        //     }
            
        //     // construct query string for URI
        //     const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
        //     const searchResponse = await fetch(searchEndpoint, requestOptions) 
        //     console.log(`\nStatus ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`)
    
        //     // Extract data and display in user-readable and understandable format
        //     // extract data from search results
        //     const searchData = await searchResponse.json()
        //     // console.log('Auto Search Data : \n', searchData)
    
        //     // Specific search result - /icd/release/11/2024-01/mms/autocode
        //     labelsArray.push(searchData.matchingText)
        //     foundationUrisArray.push(searchData.foundationURI)
        //     scoresArray.push(searchData.matchScore)
    
        //     // Handle ICD API Buggy URI (Debug_Log issue 2)
        //     const cleanedUrisArray = dataProcessor.sanitizeUrisArray(foundationUrisArray)
            
        //     const searchQueryOutput = {
        //         label: labelsArray,
        //         score: scoresArray,
        //         foundationURI: cleanedUrisArray,
        //     };
    
        //     // lookup foundationURI
        //     const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        //     const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);
            
        //     diagnosisDataArray.push({
        //         symptom: symptom,
        //         ...diagnosisData
        //     })
        // }

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