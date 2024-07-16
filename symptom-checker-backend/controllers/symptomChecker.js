/** TODO
 * Build utility modules for -
    * Request Endpoint setup
**/
// import utils
const apiHelper = require('./utils/apiRequestBuilders')
const searchHelper = require('./utils/lookupSearchData')

// GET/POST - 'Specific' search result from symptoms list
exports.getSpecificDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        const symptoms =  request.body.symptoms

        // access middleware to authenticate access and setup scheduled token update
        const requestOptions = apiHelper.buildRequestOptions();
        // search API for symptom
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'

        // Specific search result - /icd/release/11/2024-01/mms/autocode
        const searchParams = {
            searchText: symptoms,
            matchThreshold: 0.75 
        }
        
        // construct query string for URI
        const searchEndpoint = apiHelper.buildRequestEndpoint(searchParams, searchUrl);
        const searchResponse = await fetch(searchEndpoint, requestOptions)
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} :\n${searchResponse.status}`)

        // Extract data and display in user-readable and understandable format
        // extract data from search results
        const searchData = await searchResponse.json()

        // Specific search result - /icd/release/11/2024-01/mms/autocode
        const searchDataOutput = {
            searchedFor: searchData.searchText,
            results: searchData.matchingText,
            icdCode: searchData.theCode,
            foundationURI: searchData.foundationURI,
            relevancyScore: searchData.matchScore
        };

        console.log(`\nSearched for: ${searchDataOutput.searchedFor}
        Results : ${searchDataOutput.results}
        ICD code: ${searchDataOutput.icdCode}
        Foundation URI: ${searchDataOutput.foundationURI}
        Relevancy Score: ${searchDataOutput.relevancyScore}
        \n`);

        // lookup foundationURI
        const diagnosisData = await searchHelper.generateDiagnosisData(requestOptions, searchDataOutput);
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR : ', error)
        next(error)
    }
}

// GET/POST - 'General' search result from symptoms list
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        const symptoms =  request.body.symptoms

        // access middleware to authenticate access and setup scheduled token update
        const requestOptions = apiHelper.buildRequestOptions();
        // search API for symptom
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/search'

        // General search - /icd/release/11/2024-01/mms/search
        const searchParams = {
            q: symptoms,
            subtreeFilterUsesFoundationDescendants: false,
            includeKeywordResult: true,
            useFlexiSearch: true,
            flatResults: true,
            highlightingEnabled: true,
            medicalCodingMode: true 
        }
        
        // construct query string for URI
        const searchEndpoint = apiHelper.buildRequestEndpoint(searchParams, searchUrl);
        const searchResponse = await fetch(searchEndpoint, requestOptions)
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} :\n${searchResponse.status}`)

        // extract data from search results
        const searchData = await searchResponse.json()
        
        // General search results - /icd/release/11/{releasId}/{linearizationName}/search
        // destinationEntities--> MatchingPVs--> label, score, foundationUri
        const labelsArray = []
        const scoresArray = []
        const foundationURIsArray = []

        console.log(`\nSearched for: ${symptoms}`)
        if('matchingPVs' in searchData){
            for(pv of searchData.destinationEntities.matchingPVs){
                if(pv){
                    labelsArray.push(pv.label)
                    scoresArray.push(pv.score)
                    foundationURIsArray.push(pv.foundationUri)
                    console.log(`Label: ${pv.label}\n
                        Score: ${pv.score}\n
                        FoundationURI: ${pv.foundationUri}\n
                    `)
                }
            }
        }

        const searchDataOutput = {
            label: labelsArray,
            score: scoresArray,
            foundationURI: foundationURIsArray
        }

        // lookup foundationURI
        const diagnosisData = await searchHelper.generateDiagnosisData(requestOptions, searchDataOutput);
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR : ', error)
        next(error)
    }
}

