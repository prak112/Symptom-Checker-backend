// authentication request to ICD API with scheduled renewal of token
let tokenInfo = {
    tokenEndpoint: null,
    tokenOptions: null,
    accessToken: null,
    expiresIn: null,
    updateTimeout: null
}
console.log('Token info set')

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

function fetchToken(tokenData) {
    try {        
        console.log('Data from fetchToken: ', tokenData)
        tokenInfo.accessToken = tokenData.access_token
        tokenInfo.expiresIn = tokenData.expires_in  // 3600 seconds
        
        // schedule token update
        // expires_in data available, reset updateTimeout callback
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