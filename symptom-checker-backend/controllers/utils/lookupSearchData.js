const requestHelper = require('./requestBuilder')

/** REFACTOR diagnosisData
 * DONE - Recieve all results, no limitations                  
 * DONE - Omit records, If 'detail' and 'url' has 'NA'        
 * DEBUG - 'knee pain' search provides buggy foundationUri. Refactor lookupParams to handle unexpected URIs.
 * Collect highest Score with -'label,'title/detail','url' as 'topResult' 
 * Collect negative Score as 'excludedResults' and positive Score as 'includedResults' 
 * Repeat the following procedure for both Result Sets :
    * DONE(in searchQueryOutput) - Filter out duplicate Url(browserUrls)   
    * Package data by each user-provided symptom
    * For each user-provided symptom :
        * Filter 'topResult' by Score (for highlighted rendering) with Label, Detail, Score and Url
        * Sort results by Score in descending order and tag related Label (for <Chip/> rendering with Label and Score)
        * Omit 'title' and 'detail' for results, except 'topResult'
**/

async function generateDiagnosisData(requestOptions, searchQueryOutput) {
    // initialize diagnosis data
    const urlsArray = [];
    const titlesArray = [];
    const detailsArray = [];
    // lookup each foundationUri from searchQueryOutput
    for(let uri of searchQueryOutput.foundationURI){
        const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup';
        const lookupParams = {
            foundationUri: uri
        };
        //console.log('\nLookUp Parameters : ', lookupParams)
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

    // Filter records in all arrays, If 'detail' and 'url' has 'NA'
    const totalRecords = Math.min(detailsArray.length, urlsArray.length)
    // using Set for efficient lookup
    const recordsToRemove = new Set()    
    for(let i = 0; i < totalRecords; i++) {
        if(detailsArray[i] === 'NA' && urlsArray[i] === 'NA') {
            recordsToRemove.add(i)
        }        
    }
    console.log('\nRecords To Remove : \n', recordsToRemove);
    console.log(`Total Records :
        BEFORE : ${totalRecords}
        AFTER : ${totalRecords - recordsToRemove.size}
    `)

    // Array elements with indices in recordsToRemove are filtered-out iteratively
    const filteredLabels = searchQueryOutput.label.filter((_, index) => !recordsToRemove.has(index))
    const filteredScores = searchQueryOutput.score.filter((_, index) => !recordsToRemove.has(index))
    const filteredUrls = urlsArray.filter((_, index) => !recordsToRemove.has(index))
    const filteredTitles = titlesArray.filter((_, index) => !recordsToRemove.has(index))
    const filteredDetails = detailsArray.filter((_, index) => !recordsToRemove.has(index))  
    

    console.log(`LOOKUP data AFTER filtering Duplicates and NA records(url and detail) :
    LABELS: ${filteredLabels.length}
    SCORES: ${filteredScores.length}
    URLS : ${filteredUrls.length}
    TITLES : ${filteredTitles.length}
    DETAILS : ${filteredDetails.length}    
    `)
    
    // sort resultSet (aka diagnosisData) by descending 'score'
    

    // // split processed data
    // const topResult = {
    //     label: filteredLabels,
    //     score: filteredScores,        
    //     title: filteredTitles,
    //     detail: filteredDetails,
    //     url: filteredUrls,
    // }
    // const includedResults = {
    //     label: filteredLabels,
    //     score: filteredScores,        
    //     url: filteredUrls,
    // }
    // const excludedResults = {
    //     label: filteredLabels,
    //     score: filteredScores,        
    //     url: filteredUrls,
    // }
    // // pack `topResult`, `includedResults`, `excludedResults` into diagnosisData
    // const diagnosisData = {
    //     topResult: topResult,
    //     includedResults: includedResults,
    //     excludedResults: excludedResults,
    // }

    // pack searchQueryOutput and LookUp data variables
    const diagnosisData = {
        label: filteredLabels,
        score: filteredScores,        
        title: filteredTitles,
        detail: filteredDetails,
        url: filteredUrls,
    };    
    return diagnosisData;
}


module.exports = { generateDiagnosisData }