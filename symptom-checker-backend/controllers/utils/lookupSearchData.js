const requestHelper = require('./requestBuilder')
const dataProcessor = require('./refineQueryResults')

/**
 * Generates diagnosis data based on the given requestOptions and searchQueryOutput.
 * @param {Object} requestOptions - The options for the request.
 * @param {Object} searchQueryOutput - The output of the search query.
 * @returns {Object} - The diagnosis data.
 */
async function generateDiagnosisData(requestOptions, searchQueryOutput) {
    // initialize diagnosis data
    const urlsArray = [];
    const titlesArray = [];
    const detailsArray = [];
    // lookup each foundationUri from searchQueryOutput
    let count = 0;
    for(let uri of searchQueryOutput.foundationURI){
        const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup';
        const lookupParams = {
            foundationUri: uri
        };
        count++;
        //console.log(`\nLookUp Parameter #${count} : ${lookupParams}`)
        const lookupEndpoint = requestHelper.buildRequestEndpoint(lookupParams, lookupUrl);
        const lookupResponse = await fetch(lookupEndpoint, requestOptions);
        const lookupData = await lookupResponse.json();

        // validate and update arrays for 'browserUrl','title','definition'
        lookupData.browserUrl.includes('unspecified')|| lookupData.browserUrl.includes('other') 
            ? urlsArray.push('NA')
            : urlsArray.push(lookupData.browserUrl)
        lookupData.title["@value"].includes('unspecified')
            ? titlesArray.push('NA')
            : titlesArray.push(lookupData.title["@value"])
        lookupData.definition
            ? detailsArray.push(lookupData.definition["@value"].toString())
            : detailsArray.push('NA')
    }

    // Filter records from all arrays, If 'detail' and 'url' has 'NA'
    const filteredLabels = dataProcessor.filterNARecords(detailsArray, urlsArray, searchQueryOutput.label)
    const filteredScores = dataProcessor.filterNARecords(detailsArray, urlsArray, searchQueryOutput.score)
    const filteredUrls = dataProcessor.filterNARecords(detailsArray, urlsArray, urlsArray)
    const filteredTitles = dataProcessor.filterNARecords(detailsArray, urlsArray, titlesArray)
    const filteredDetails = dataProcessor.filterNARecords(detailsArray, urlsArray, detailsArray)

    console.log(`LOOKUP data AFTER filtering Duplicates and NA records(url and detail) :
    LABELS: ${filteredLabels.length}
    SCORES: ${filteredScores.length}
    TITLES : ${filteredTitles.length}
    DETAILS : ${filteredDetails.length}     
    URLS : ${filteredUrls.length}
    `)

    // reorder all arrays based on sortedScoresIndices
    const sortedLabels = dataProcessor.reorderArray(filteredLabels, filteredScores)
    const sortedDecimalScores = dataProcessor.reorderArray(filteredScores, filteredScores)
    const sortedNumericalScores = sortedDecimalScores.map(score => Math.round((score * 100), 2))
    const sortedUrls = dataProcessor.reorderArray(filteredUrls, filteredScores)
    const sortedTitles = dataProcessor.reorderArray(filteredTitles, filteredScores)
    const sortedDetails = dataProcessor.reorderArray(filteredDetails, filteredScores)
    
    console.log(`Sorted Arrays :
    LABELS: ${sortedLabels.length}
    SCORES : ${sortedNumericalScores.length}
    TITLES : ${sortedTitles.length}
    DETAILS : ${sortedDetails.length}    
    URLS : ${sortedUrls.length}
    `)    

    // split processed arrays 
    // processed = (filter duplicates and NA records)+(subset arrays by filteredScores.length)+(sort by sortedScoreIndices)
    const topResult = {
        label: sortedLabels[0],
        score: sortedNumericalScores[0],        
        title: sortedTitles[0],
        detail: sortedDetails[0],
        url: sortedUrls[0],
    }
    console.log('\nTOP Result : ', topResult);
    // locate negative scores to setup slicing point
    const resultsExclusionIndex = sortedNumericalScores.findIndex(score => score < 0)
    // slice for includedResults
    const includedLabels = sortedLabels.slice(1, resultsExclusionIndex)
    const includedScores = sortedNumericalScores.slice(1, resultsExclusionIndex)
    const includedUrls = sortedUrls.slice(1, resultsExclusionIndex)
    const includedResults = {
        label: includedLabels,
        score: includedScores,        
        url: includedUrls,
    }
    console.log('INCLUDED Results : ', includedResults)
    // slice for excludedResults
    const excludedLabels = sortedLabels.slice(resultsExclusionIndex)
    const excludedScores = sortedNumericalScores.slice(resultsExclusionIndex)
    const excludedUrls = sortedUrls.slice(resultsExclusionIndex)
    const excludedResults = {
        label: excludedLabels,
        score: excludedScores,        
        url: excludedUrls,
    }
    console.log('EXCLUDED Results : ', excludedResults)

    // pack processed data
    const diagnosisData = {
        topResult: topResult,
        includedResults: includedResults,
        excludedResults: excludedResults,
    }

    return diagnosisData;
}


module.exports = { generateDiagnosisData }