/**
 * Objective: Refactor code to setup Express server
 * GOAL #1: Authenticate ICD API through middleware
 * GOAL #2: Setup requests with symptoms
    * API Call -
    * /icd/release/11/2024-01/mms/autocode?searchText=sore%20throat&matchThreshold=0.75
 * GOAL #3: Process and generate data to be placed for triage-level assessment in React Component (Diagnosis.jsx)
    * Use 'foundationURI' in API Call -
    * /icd/release/11/2024-01/mms/lookup?foundationUri=http%3A%2F%2Fid.who.int%2Ficd%2Fentity%2F633724732
    * response includes 'browserUrl', 'title', 'definition', 
    * other possible conditions list - 'exclusion', 'indexTerm'
**/


// imports
const middleware = require('./middleware')

// Setup ICD API access
// ICD API authentication to OAUTH 2.0 Token Endpoint (token from API for access)
const tokenEndpoint = 'https://icdaccessmanagement.who.int/connect/token'
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
console.log('Credentials loaded')


// collect payload data as 'payload'
const payload = {
    'client_id': clientId,
    'client_secret': clientSecret,
    'scope': 'icdapi_access',
    'grant_type': 'client_credentials'
}

// convert payload to URL-encoded format
const requestBody = Object.keys(payload)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
    .join('&')
console.log('Payload URL-encoded')

// setup request options for fetching token
const tokenOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: requestBody
}
console.log('Options set');


// Send request with symptoms and receive data
// Foundation Model : https://icd.who.int/browse/2024-01/foundation/en#448895267

// access middleware to authenticate access and setup scheduled token update
const getTokenAndData = async() => {
    const token = await middleware.authenticateApiAccess(tokenEndpoint, tokenOptions)

    console.log('Fetching token...');
    console.log('Token: ', token)
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'API-Version': 'v2',
            'Accept-Language': 'en',
            'Accept': 'application/json'
        }
    }
    // search API for symptom
    const searchUrl = 'https://id.who.int/icd/release/11/2024-01/mms/autocode'
    const symptom = 'sore throat'

    // Narrowed down result - /icd/release/11/2024-01/mms/autocode
    const searchParams = {
        searchText: symptom,
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
    console.log(`\nVisit ICD WHO website for more info : ${lookupData.browserUrl}
    Diagnosed condition : ${lookupData.title["@value"]}
    General details : ${lookupData.definition["@value"]}
    \n`)
    for(term of lookupData.indexTerm){
        console.log('Possible Conditions : ', term.label["@value"])
    }
    for(entity of lookupData.exclusion){
        console.log('Excluded Conditions : ', entity.label["@value"])
    }

}
getTokenAndData()