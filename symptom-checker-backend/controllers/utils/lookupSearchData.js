async function generateDiagnosisData(requestOptions, searchDataOutput) {
    // initialize diagnosis data
    const browserUrlsArray = [];
    const titlesArray = [];
    const detailsArray = [];
    // lookup each foundationUri from searchDataOutput
    for (uri of searchDataOutput.foundationURI) {
        const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup';
        const lookupParams = {
            foundationUri: uri
        };
        const lookupEndpoint = apiHelper.buildRequestEndpoint(lookupParams, lookupUrl);
        const lookupResponse = await fetch(lookupEndpoint, requestOptions);
        const lookupData = await lookupResponse.json();

        // extract 'browserUrl','title','definition'
        browserUrlsArray.push(lookupData.browserUrl);
        titlesArray.push(lookupData.title["@value"]);
        detailsArray.push(lookupData.definition["@value"]);

        console.log(`\nVisit ICD WHO website for more info : ${lookupData.browserUrl}
            Diagnosed condition : ${lookupData.conditionTitle}
            General details : ${lookupData.conditionDetails}
            \n`);
    }

    // pack searchDataOutput and LookUp API query data variables
    const diagnosisData = {
        label: searchDataOutput.label,
        score: searchDataOutput.score,
        url: browserUrlsArray,
        title: titlesArray,
        detail: detailsArray
    };
    return diagnosisData;
}


module.exports = { generateDiagnosisData }