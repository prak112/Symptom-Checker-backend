// utility functions
const requestHelper = require('./requestBuilder')
const searchHelper = require('./lookupSearchData')
const dataProcessor = require('./refineQueryResults')

/**
 * Generates general diagnosis data based on the given search options and symptoms.
 * 
 * @param {Object} request - HTTP request object.
 * @param {string} searchUrl - API endpoint for search query
 * @param {string} symptoms - The symptoms to search for.
 * @returns {Promise<void>} - A promise that resolves when the diagnosis data is generated.
 */
async function generateGeneralDiagnosis(request, searchUrl, symptoms) {
    // intialize arrays for diagnosis data
    let labelsArray = [];
    let scoresArray = [];
    let foundationUrisArray = [];
    // General search - /icd/release/11/2024-01/mms/search
    const searchParams = {
        q: symptoms,
        subtreeFilterUsesFoundationDescendants: false,
        includeKeywordResult: true,
        useFlexisearch: true,
        flatResults: true,
        highlightingEnabled: true,
        medicalCodingMode: true
    };
    
    // setup API auth for search query
    const requestOptions = await requestHelper.buildRequestOptions(request, 'POST');
    // construct query string for URI
    const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
    const searchResponse = await fetch(searchEndpoint, requestOptions);
    console.log(`\nSEARCH ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`);

    // extract data from search results
    const searchData = await searchResponse.json();

    // General search results - /icd/release/11/{releasId}/{linearizationName}/search
    // Data crawl map : destinationEntities--> MatchingPVs--> label, score, foundationUri
    for (let entity of searchData.destinationEntities) {
        if (entity.matchingPVs && Array.isArray(entity.matchingPVs)) {
            for (let pv of entity.matchingPVs) {
                // avoid duplicate data in searchQueryOutput
                if (foundationUrisArray.includes(pv.foundationUri)) {
                    break;
                }
                else {
                    labelsArray.push(pv.label);
                    scoresArray.push(pv.score);
                    foundationUrisArray.push(pv.foundationUri);
                    //console.log('URI #',uriCount,' : ', pv.foundationUri);                        
                }
            }
        }
    }
    console.log(`SEARCH data AFTER filtering Duplicates (foundationUri) :
    LABELS: ${labelsArray.length}
    SCORES: ${scoresArray.length}
`);

    // Handle ICD API Buggy URI (Debug_Log issue 2)
    const cleanedUrisArray = dataProcessor.sanitizeUrisArray(foundationUrisArray);

    // pack search data for LookUp query
    const searchQueryOutput = {
        label: labelsArray,
        score: scoresArray,
        foundationURI: cleanedUrisArray,
    };

    // lookup foundationURI
    const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
    const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);

    return diagnosisData
}


/**
 * Generates specific diagnosis data based on the given search options and symptoms.
 * 
 * @param {Object} request - HTTP request object.
 * @param {string} searchUrl - API endpoint for search query
 * @param {string} symptoms - The symptoms to search for.
 * @returns {Promise<void>} - A promise that resolves when the diagnosis data is generated.
 */
async function generateSpecificDiagnosis(request, searchUrl, symptoms) {
    // intialize arrays for diagnosis data
    let labelsArray = [];
    let scoresArray = [];
    let foundationUrisArray = [];

    // Specific search result - /icd/release/11/2024-01/mms/autocode
    const searchParams = {
        searchText: symptoms
    };

    // setup API auth for search query
    const requestOptions = await requestHelper.buildRequestOptions(request, 'GET');
    // construct query string for URI
    const searchEndpoint = requestHelper.buildRequestEndpoint(searchParams, searchUrl);
    const searchResponse = await fetch(searchEndpoint, requestOptions);
    console.log(`\nStatus ${requestOptions.method} ${searchUrl} : ${searchResponse.status}`);

    // extract data from search results
    // Data crawl map : searchData-> matchingText, foundationUri, matchScore
    const searchData = await searchResponse.json();
    labelsArray.push(searchData.matchingText);
    foundationUrisArray.push(searchData.foundationURI);
    scoresArray.push(searchData.matchScore);

    // Handle ICD API Buggy URI (Debug_Log issue 2)
    const cleanedUrisArray = dataProcessor.sanitizeUrisArray(foundationUrisArray);

    const searchQueryOutput = {
        label: labelsArray,
        score: scoresArray,
        foundationURI: cleanedUrisArray,
    };

    // lookup foundationURI
    const lookUpRequestOptions = await requestHelper.buildRequestOptions(request, 'GET');
    const diagnosisData = await searchHelper.generateDiagnosisData(lookUpRequestOptions, searchQueryOutput);

    return diagnosisData
}


module.exports = {
    generateGeneralDiagnosis,
    generateSpecificDiagnosis,
}