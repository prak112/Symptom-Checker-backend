// import utils
const requestHelper = require('./utils/requestBuilder')
const searchHelper = require('./utils/lookupSearchData')

// POST - 'General' search result from symptoms list
exports.getGeneralDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        const symptoms =  request.body.symptoms
        console.log('Symptoms Data: ', symptoms)

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
        const searchResponse = await fetch(searchEndpoint, requestOptions)  // ERROR - search request setup
        console.log('Request Options : ', requestOptions)
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} :\n${searchResponse.status}`)

        // extract data from search results
        const searchData = await searchResponse.json()
        console.log(searchData)

        // General search results - /icd/release/11/{releasId}/{linearizationName}/search
        // destinationEntities--> MatchingPVs--> label, score, foundationUri
        const labelsArray = []
        const scoresArray = []
        const foundationURIsArray = []
        let limitResults = 3;
        for(let entity of searchData.destinationEntities){
            if(entity.matchingPVs && Array.isArray(entity.matchingPVs)){
                for(let pv of entity.matchingPVs){
                    if(limitResults > 0){
                        console.log(`
                            Label: ${pv.label}\nScore: ${pv.score}\nFoundationURI: ${pv.foundationUri}\n
                        `);
                        labelsArray.push(pv.label);
                        scoresArray.push(pv.score);
                        foundationURIsArray.push(pv.foundationUri);
                        limitResults--;
                    } else {
                        break;
                    }
                }
            }
        }

        console.log('LABELS:\n', labelsArray)
        console.log('SCORES:\n', scoresArray)
        console.log('URIs:\n', foundationURIsArray)

        const searchDataOutput = {
            label: labelsArray,
            score: scoresArray,
            foundationURI: foundationURIsArray
        }

        // lookup foundationURI
        const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchDataOutput);
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
        const searchResponse = await fetch(searchEndpoint, requestOptions)  // ERROR - 'specific' search
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} :\n${searchResponse.status}`)

        // Extract data and display in user-readable and understandable format
        // extract data from search results
        const searchData = await searchResponse.json()

        // Specific search result - /icd/release/11/2024-01/mms/autocode
        //const foundationURIArray = []
        const searchDataOutput = {
            label: searchData.matchingText,
            foundationURI: searchData.foundationURI,
            score: searchData.matchScore
        };

        console.log(`\nSearched for: ${searchData.searchText}
        Results : ${searchDataOutput.label}
        ICD code: ${searchData.theCode}
        Foundation URI: ${searchDataOutput.foundationURI}
        Relevancy Score: ${searchDataOutput.score}
        \n`);

        // lookup foundationURI
        const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
        const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchDataOutput);
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR during Specific search : ', error)
    }
}



