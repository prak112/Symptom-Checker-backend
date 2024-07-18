const requestHelper = require('./requestBuilder')

async function generateDiagnosisData(requestOptions, searchDataOutput) {
    // initialize diagnosis data
    const browserUrlsArray = [];
    const titlesArray = [];
    const detailsArray = [];
    // lookup each foundationUri from searchDataOutput
    const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup';
    const lookupParams = {
        foundationUri: searchDataOutput.foundationURI
    };
    const lookupEndpoint = requestHelper.buildRequestEndpoint(lookupParams, lookupUrl);
    const lookupResponse = await fetch(lookupEndpoint, requestOptions);
    const lookupData = await lookupResponse.json();

    // extract 'browserUrl','title','definition'
    browserUrlsArray.push(lookupData.browserUrl);
    titlesArray.push(lookupData.title["@value"]);
    detailsArray.push(lookupData.definition["@value"]);

    console.log(`\nVisit ICD WHO website for more info : ${lookupData.browserUrl}
        Diagnosed condition : ${lookupData.title["@value"]}
        General details : ${lookupData.definition["@value"]}
        \n`);

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