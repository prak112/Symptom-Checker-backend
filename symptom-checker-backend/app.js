/**
 * MAIN OBJECTIVE: Refactor code to setup Express server
 ** 
 * GOAL #1: Authenticate ICD API through middleware
 * GOAL #2: Setup requests with symptoms
    * use 'searchText' in API Call -
    * /icd/release/11/2024-01/mms/autocode?searchText=sore%20throat&matchThreshold=0.75
 * GOAL #3: Process and generate data to be placed for triage-level assessment in React Component (Diagnosis.jsx)
    * Use 'foundationURI' in API Call -
    * /icd/release/11/2024-01/mms/lookup?foundationUri=http%3A%2F%2Fid.who.int%2Ficd%2Fentity%2F633724732
    * response includes 'browserUrl', 'title', 'definition', 
    * other possible conditions list - 'exclusion', 'indexTerm'
**/

// intial setup
const express = require('express')
const app = express()
const cors = require('cors')  // cross-origin resource sharing
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const apiAuthenticator = require('./utils/apiAuthenticator')
const symptomCheckerRouter = require('./routes/symptomCheckerRouter')


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


// load middleware
app.use(cors())   // accepts frontend communication from different origin
app.use(express.json()) // json-parser for request body
app.use(middleware.requestLogger)
// ICD API authentication process
logger.info('Initiate auth from app.js...')
const token = apiAuthenticator.authenticateApiAccess(tokenEndpoint, tokenOptions) 
app.use((request, response, next) => {
   try {
      request.accessToken = token
      next()
   } 
   catch (error) {
      logger.error('ICD API Authentication error : ', error)
      response.status(500).send('ICD API Authentication Failed')
   }
})

// route requests
app.use('/api/protected/symptoms', symptomCheckerRouter)

// error handlers
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app
