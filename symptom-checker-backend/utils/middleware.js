
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