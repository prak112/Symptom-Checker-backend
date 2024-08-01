// imports
const logger = require('../../utils/logger')
const config = require('../../utils/config')
const apiAuthenticator = require('../../utils/apiAuthenticator')

// Setup ICD API access
// ICD API authentication to OAUTH 2.0 Token Endpoint (token from API for access)
const tokenEndpoint = 'https://icdaccessmanagement.who.int/connect/token'
const clientId = config.CLIENT_ID
const clientSecret = config.CLIENT_SECRET
logger.info('Credentials loaded')
// collect request data as 'payload'
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
logger.info('Payload URL-encoded')
// setup request options for fetching token
const tokenOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: requestBody
}
logger.info('Options set');
// ICD API authentication process
logger.info('Initiate ICD API authentication...')
const token = apiAuthenticator.authenticateApiAccess(tokenEndpoint, tokenOptions) 
const authenticate = (request, response, next) => {
   try {
      request.accessToken = token
      next()
   } 
   catch (error) {
      logger.error('ICD API Authentication error : ', error)
      response.status(500).send('ICD API Authentication Failed')
   }
}

module.exports = { authenticate }