// authentication request to ICD API with scheduled renewal of token
let tokenInfo = {
    tokenEndpoint: null,
    tokenOptions: null,
    accessToken: null,
    expiresIn: null,
    updateTimeout: null
}
console.log('Token info set')

/**
 * Authenticates API access using the provided token endpoint and options.
 * 
 * @param {string} tokenEndpoint - The endpoint to fetch the access token from.
 * @param {object} tokenOptions - The options to be passed to the token endpoint.
 * @returns {Promise<string>} - A promise that resolves to the access token.
 * @throws {Error} - If there is an error fetching the token.
 */
async function authenticateApiAccess(tokenEndpoint, tokenOptions){
try {
        if (!tokenInfo.accessToken) {
            tokenInfo.tokenEndpoint = tokenEndpoint
            tokenInfo.tokenOptions = tokenOptions
            const tokenClient = await fetch(tokenInfo.tokenEndpoint, tokenInfo.tokenOptions)
            const data = await tokenClient.json()
            return fetchToken(data)
        } else {
            return tokenInfo.accessToken
        }
    } catch (error) {
        console.log('ERROR fetching Token : ', error.message)
        next(error)
    }
}

/**
 * Fetches a token and updates the token information.
 * 
 * @param {Object} tokenData - The token data object.
 * @param {string} tokenData.token_type - The type of the token.
 * @param {string} tokenData.access_token - The access token.
 * @param {number} tokenData.expires_in - The expiration time of the token in seconds.
 * @returns {string} - The access token.
 * @throws {Error} - If there is an error fetching the token.
 */
function fetchToken(tokenData) {
    try {        
        console.log('Token type: ', tokenData.token_type)
        tokenInfo.accessToken = tokenData.access_token
        tokenInfo.expiresIn = tokenData.expires_in  // 3600 seconds
        
        // schedule token update
        // reset updateTimeout callback
        if(tokenInfo.updateTimeout){
            clearInterval(tokenInfo.updateTimeout)
            console.log('Clear Token update callback')
        }
        // schedule api authentication 30 seconds before
        let currentTime = new Date() // time in UTC format
        let tokenGeneratedTime = currentTime.toLocaleTimeString()
        let tokenExpiryTime = new Date(
            currentTime.getTime() + (tokenInfo.expiresIn * 1000)
        ).toLocaleTimeString()
        tokenInfo.updateTimeout = setInterval(async() => {
            // renewal failure : return variable from authenticateApiAcess not caught in tokenInfo.accessToken
            await authenticateApiAccess(tokenInfo.tokenEndpoint, tokenInfo.tokenOptions);
            let tokenRenewedTime = new Date().toLocaleTimeString()
            console.log('Token updated - ', tokenRenewedTime);
        }, (tokenInfo.expiresIn - 30) * 1000);

        console.log(`Token generated at ${tokenGeneratedTime}\nToken will be renewed at ${tokenExpiryTime}`)
        return tokenInfo.accessToken
    } catch (error) {
        console.log('ERROR fetching Token : ', error.message)
        next(error)
    }
}


module.exports = { authenticateApiAccess }