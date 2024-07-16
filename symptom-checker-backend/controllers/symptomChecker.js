// GET - short symptoms list
exports.getDiagnosis = async(request, response, next) => {
    try {
        // retrieve symptoms
        const symptoms =  request.body.symptoms

        // access middleware to authenticate access and setup scheduled token update
        console.log('Fetching token...');
        console.log('Token: ', token)
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'API-Version': 'v2',
                'Accept-Language': 'en',
                'Accept': 'application/json'
            }
        }
        // search API for symptom
        const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'

        // Narrowed down result - /icd/release/11/2024-01/mms/autocode
        const searchParams = {
            searchText: symptoms,
            matchThreshold: 0.75 
        }
        
        // construct query string for URI
        const searchString = new URLSearchParams(searchParams)

        // setup search request to endpoint
        const searchEndpoint = `${searchUrl}?${searchString}`
        const searchResponse = await fetch(searchEndpoint, requestOptions)
        console.log(`\nStatus ${requestOptions.method} ${searchUrl} :\n${searchResponse.status}`)

        // Extract data and display in user-readable and understandable format
        // extract data from search results
        const searchData = await searchResponse.json()

        // Narrowed down result - /icd/release/11/2024-01/mms/autocode
        console.log(`\nSearched for: ${searchData.searchText}
        Results : ${searchData.matchingText}
        ICD code: ${searchData.theCode}
        Foundation URI: ${searchData.foundationURI}
        Relevancy Score: ${searchData.matchScore}
        \n`)

        // lookup foundationURI - /icd/release/11/2024-01/mms/lookup?foundationUri=http%3A%2F%2Fid.who.int%2Ficd%2Fentity%2F633724732
        const lookupUrl = 'https://id.who.int/icd/release/11/2024-01/mms/lookup'
        const lookupParams = { 
            foundationUri: searchData.foundationURI
        }
        const lookupString = new URLSearchParams(lookupParams)

        const lookupEndpoint = `${lookupUrl}?${lookupString}`
        const lookupResponse = await fetch(lookupEndpoint, requestOptions)
        const lookupData = await lookupResponse.json()
        
        // extract 'browserUrl','title','definition','exclusion','indexTerm'
        const diagnosisData = {
            browserUrl: lookupData.browserUrl,
            diagnosedCondition: lookupData.title["@value"],
            generalDetails: lookupData.definition["@value"],
            possibleConditions: lookupData.indexTerm.map(term => term.label["@value"]),
            excludedConditions: lookupData.exclusion.map(entity => entity.label["@value"])
        };

        console.log(`\nVisit ICD WHO website for more info : ${diagnosisData.browserUrl}
        Diagnosed condition : ${diagnosisData.diagnosedCondition}
        General details : ${diagnosisData.generalDetails}
        \n`);

        for (let term of diagnosisData.possibleConditions) {
            console.log('Possible Conditions : ', term);
        }

        for (let entity of diagnosisData.excludedConditions) {
            console.log('Excluded Conditions : ', entity);
        }
        response.status(200).json(diagnosisData)
    } 
    catch(error) {
        console.error('ERROR : ', error)
        next(error)
    }
}