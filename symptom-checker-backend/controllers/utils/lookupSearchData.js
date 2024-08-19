const requestHelper = require('./requestBuilder')

/** REFACTOR diagnosisData
 * Recieve all results, no limitations - DONE
 * Collect highest Score with -'label,'title/detail','url' as 'topResult'
 * Collect negative Score as 'excludedResults' and positive Score as 'includedResults' 
 * Repeat the following procedure for both Result Sets :
    * Filter out duplicate Url(browserUrls) - DONE(in searchDataOutput)
    * Package data by each user-provided symptom
    * For each user-provided symptom :
        * Filter 'topResult' by Score (for highlighted rendering) with Label, Detail, Score and Url
        * Sort results by Score in descending order and tag related Label (for <Chip/> rendering with Label and Score)
        * Omit Title and Detail for results, except 'topResult'
**/

async function generateDiagnosisData(requestOptions, searchDataOutput) {
    // initialize diagnosis data
    const urlsArray = [];
    const titlesArray = [];
    const detailsArray = [];
    // lookup each foundationUri from searchDataOutput
    for(uri of searchDataOutput.foundationURI){
        const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup';
        const lookupParams = {
            foundationUri: uri
        };
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

    // filter for duplicates - 
    // title, url, searchDataOutput.label, searchDataOutput.score
    console.log(`\nLOOKUP data AFTER filtering for duplicates :
    LABELS: ${searchDataOutput.label.length}
    SCORES: ${searchDataOutput.score.length}
    URLS : ${urlsArray.length}
    TITLES : ${titlesArray.length}
    DETAILS : ${detailsArray.length}    
    `)
    

    // // sort by descending 'score'


    // // split processed data
    // const topResult = {
    //     label: searchDataOutput.label,
    //     score: searchDataOutput.score,        
    //     title: titlesArray,
    //     detail: detailsArray,
    //     url: urlsArray,
    // }
    // const includedResults = {
    //     label: searchDataOutput.label,
    //     score: searchDataOutput.score,        
    //     url: urlsArray,
    // }
    // const excludedResults = {
    //     label: searchDataOutput.label,
    //     score: searchDataOutput.score,        
    //     url: urlsArray,
    // }
    // // pack `topResult`, `includedResults`, `excludedResults` into diagnosisData
    // const diagnosisData = {
    //     topResult: topResult,
    //     includedResults: includedResults,
    //     excludedResults: excludedResults,
    // }

    // pack searchDataOutput and LookUp API query data variables
    const diagnosisData = {
        label: searchDataOutput.label,
        score: searchDataOutput.score,        
        title: titlesArray,
        detail: detailsArray,
        url: urlsArray,
    };    
    return diagnosisData;
}


module.exports = { generateDiagnosisData }