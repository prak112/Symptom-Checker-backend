// import utils
const requestHelper = require('../utils/requestBuilder')
const searchHelper = require('../utils/lookupSearchData')
// Setup MongoDB collection and data storage

/* REFACTOR diagnosisData
ERRORS:
======
- NaN% in 'detail' : 
	- *Assumption* If 'detail' has text WITH numbers React represents it as 'NaN%'

TO DOs:
=======
- FEATURE: Show pain location in 2D-body image 
*/

// POST - 'General' search result from symptoms list
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // intialize arrays for diagnosis data
        let labelsArray = []
        let scoresArray = []
        let foundationUrisArray = []

        // retrieve symptoms
        const symptoms =  request.body.symptoms
        console.log('\nSEARCH Query for : ', symptoms);
        
        // access middleware to authenticate access and setup scheduled token update
        const requestOptions = await requestHelper.buildRequestOptions(request, 'POST');
        
        // search API for symptom
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/search'

        // General search - /icd/release/11/2024-01/mms/search
        const searchParams = {
            q: symptoms,
            subtreeFilterUsesFoundationDescendants: false,
            includeKeywordResult: true,
            useFlexisearch: true,
            flatResults: true,
            highlightingEnabled: true,
            medicalCodingMode: true 
        }
        
        // construct query string for URI
        const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
        const searchResponse = await fetch(searchEndpoint, requestOptions)
        // console.log('Request Options : ', requestOptions)
        console.log(`\nSEARCH ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`)

        // extract data from search results
        const searchData = await searchResponse.json()

        // General search results - /icd/release/11/{releasId}/{linearizationName}/search
        // Data crawl map : destinationEntities--> MatchingPVs--> label, score, foundationUri
        let uriCount = 0;
        for(let entity of searchData.destinationEntities) {
            if(entity.matchingPVs && Array.isArray(entity.matchingPVs)) {
                for(let pv of entity.matchingPVs) {
                    // avoid duplicate data in searchQueryOutput
                    if(foundationUrisArray.includes(pv.foundationUri)) {
                        break
                    }
                    else {
                        labelsArray.push(pv.label);
                        scoresArray.push(pv.score);
                        foundationUrisArray.push(pv.foundationUri);
                        uriCount++;
                        console.log('URI #',uriCount,' : ', pv.foundationUri);                        
                    }
                }
            }
        }

        // Handle ICD API Buggy URI (Debug_Log issue 2)
        const cleanedUrisArray = []
        for (let uri of foundationUrisArray) {
            const cleanedUris = uri.split(/[&]/).map(part => part.trim())
            cleanedUris.map(uri => cleanedUrisArray.push(uri))
        }
        console.log(`SEARCH data AFTER filtering Duplicates (foundationUri) :
            LABELS: ${labelsArray.length}
            SCORES: ${scoresArray.length}
            Original URIs : ${foundationUrisArray.length}
            Cleaned URIs : ${cleanedUrisArray.length}
        `)

        // pack search data for LookUp query
        const searchQueryOutput = {
            label: labelsArray,
            score: scoresArray,
            foundationURI: cleanedUrisArray,
        }

        // lookup foundationURI
        const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR during General search : ', error)
        next(error)
    }
}

// POST - 'Specific' search result from symptoms list
exports.getSpecificDiagnosis = async(request, response) => {
    try {
        // intialize arrays for diagnosis data
        let labelsArray = []
        let scoresArray = []
        let foundationUrisArray = []

        // retrieve symptoms
        const symptoms =  request.body.symptoms

        // access middleware to authenticate access and setup scheduled token update
        const requestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        // search API for symptom
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'

        // Specific search result - /icd/release/11/2024-01/mms/autocode
        const searchParams = {
            searchText: symptoms
        }
        
        // construct query string for URI
        const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
        const searchResponse = await fetch(searchEndpoint, requestOptions) 
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`)

        // Extract data and display in user-readable and understandable format
        // extract data from search results
        const searchData = await searchResponse.json()
        // console.log('Auto Search Data : \n', searchData)

        // Specific search result - /icd/release/11/2024-01/mms/autocode
        labelsArray.push(searchData.matchingText)
        foundationUrisArray.push(searchData.foundationURI)
        scoresArray.push(searchData.matchScore)

        const searchQueryOutput = {
            label: labelsArray,
            foundationURI: foundationUrisArray,
            score: scoresArray
        };

        // console.log(`\nSearched for: ${searchData.searchText}
        // Results : ${searchQueryOutput.label}
        // ICD code: ${searchData.theCode}
        // Foundation URI: ${searchQueryOutput.foundationURI}
        // Relevancy Score: ${searchQueryOutput.score}
        // \n`);

        // lookup foundationURI
        const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR during Specific search : ', error)
    }
}



