// imports
const config = require('./config')

// Setup ICD API access
// ICD API authentication to OAUTH 2.0 Token Endpoint (token from API for access)
const tokenEndpoint = 'https://icdaccessmanagement.who.int/connect/token'
const clientId = config.CLIENT_ID
const clientSecret = config.CLIENT_SECRET
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


// authentication request to ICD API with scheduled renewal of token
let tokenInfo = {
    accessToken: null,
    expiresIn: null,
    updateTimeout: null
}

async function authenticateApiAccess(tokenEndpoint, tokenOptions){
try {
        if (!tokenInfo.accessToken) {
            const tokenClient = await fetch(tokenEndpoint, tokenOptions)
            const data = await tokenClient.json()
            return fetchToken(data)
        } else {
            return tokenInfo.accessToken
        }
    } catch (error) {
        throw new Error('ERROR fetching Token : ', error.message)
    }
}

function fetchToken(tokenData) {
    try {        
        console.log('Data from fetchToken: ', tokenData)
        tokenInfo.accessToken = tokenData.access_token
        tokenInfo.expiresIn = tokenData.expires_in  // 3600 seconds
        
        // schedule token update
        // expires_in data available, reset updateTimeout callback
        if(tokenInfo.updateTimeout){
            clearTimeout(tokenInfo.updateTimeout)
            console.log('Clear Token update callback')
        }
        // schedule api authentication 30 seconds before
        let localTime = new Date().toLocaleTimeString()
        tokenInfo.updateTimeout = setTimeout(async() => {
            await authenticateApiAccess(tokenEndpoint, tokenOptions);
            console.log('Token updated - ', localTime);
        }, (tokenInfo.expiresIn - 30) * 1000);

        console.log(`Token generated at ${localTime}\nToken will be renewed in ${tokenInfo.expiresIn - 30} seconds`)
        return tokenInfo.accessToken
    } catch (error) {
        throw new Error('ERROR fetching Token : ', error.message)
    }
}


module.exports = { authenticateApiAccess }