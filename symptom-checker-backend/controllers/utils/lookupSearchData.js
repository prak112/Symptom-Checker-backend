const requestHelper = require('./requestBuilder')

/** REFACTOR diagnosisData
 * DONE - Recieve all results, no limitations                  
 * DONE - Omit records, If 'detail' and 'url' has 'NA'        
 * DONE - DEBUG - 'knee pain' search provides buggy foundationUri. Refactor lookupParams to handle unexpected URIs.
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

    // Filter records in all arrays, If 'detail' and 'url' has 'NA'
    const totalRecords = Math.min(detailsArray.length, urlsArray.length)
    // using Set for efficient lookup
    const recordsToRemove = new Set()    
    for(let i = 0; i < totalRecords; i++) {
        if(detailsArray[i] === 'NA' && urlsArray[i] === 'NA') {
            recordsToRemove.add(i)
        }        
    }
    console.log('\nRecords To Remove : \n', recordsToRemove.size);
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

    // Sort by descending 'score'
    /** Procedure :
    * sort filteredScores by pairing {score, index} = sortedFilteredScores
    * get the sorted indices from sortedFilteredScores
    * reorder the rest of the filtered arrays based on the sorted indices of sortedFilteredScores
    */
    /** Complications :
    * Total records from searchQueryOutput(label, score) !== lookupData(url, title, detail)
        * Above complication only happens for certain symptoms (ex. knee pain, knee joint pain)
        * DUE to Buggy-foundationUri Issue from ICD API
    * However, frontend ONLY renders the lowest number, i.e., searchQueryOutput record count
    * As long as record count in searchQueryOutput < lookupData, No issues will be found.
    */
    // pair score and index of filteredScores array
    const indexedScores = filteredScores.map((score, index) => ({ score, index }))
    // sort items in indexedScores by score property
    const sortedFilteredScores = indexedScores.sort((a, b) => (+(b.score)*100) - (+(a.score)*100))
    // collect indices from sortedFilteredScores object 
    const sortedScoresIndices = sortedFilteredScores.map(pair => pair.index)
    //console.log('Sorted Scores array : ', sortedFilteredScores);
    console.log('Total Sorted Indices : ', sortedScoresIndices.length);
    
    /** Sort rest of the arrays by sortedScoreIndices
     * splice all arrays to same length as filteredScores
     * create new Array(filteredScores.length)
     * iterate through sortedScoreIndices and add items in sorted order 
    **/
//    EXAMPLE
//    // Original array
//     const originalArray = ['a', 'b', 'c', 'd', 'e'];

//     // Given order of indices
//     const order = [3, 0, 4, 1, 2];

//     // Step 1: Create a new array of the same length as the original array
//     const sortedArray = new Array(originalArray.length);

//     // Step 2: Iterate over the order array
//     order.forEach((newIndex, currentIndex) => {
//     // Step 3: Place the corresponding element from the original array into the new array
//     sortedArray[currentIndex] = originalArray[newIndex];
//     });

//     console.log('Sorted Array:', sortedArray); 
    



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