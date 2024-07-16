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
const apiAuthenticator = require('./utils/apiAuthenticator')
const symptomCheckerRouter = require('./routes/symptomCheckerRouter')

// load middleware
app.use(express.json())

// route requests
app.use(apiAuthenticator.authenticateApiAccess)
app.use('/api/protected/symptoms', symptomCheckerRouter)

module.exports = app
