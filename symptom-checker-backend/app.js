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

// Intial setup
const config = require('./utils/config')
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const cors = require('cors')  // cross-origin resource sharing
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const apiAuthController = require('./controllers/auth/apiAuthController')
const signupRouter = require('./controllers/auth/signup')
const loginRouter = require('./controllers/auth/login')
const symptomCheckerRouter = require('./routes/symptomCheckerRouter')


// Setup MongoDB connection
const mongoose = require('mongoose')
mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB')
    })
    .catch((error) => {
        logger.info('Error connecting to MongoDB!\nERROR: ', error.message)
    })


// Load Middleware

// ICD API authentication middeware
app.use(apiAuthController.authenticate)

// CORS-accepts frontend communication from different origin
app.use(cors({
    origin: 'http://localhost:5173/',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
// json-parser for request body   
app.use(express.json()) 
app.use(middleware.requestLogger)


// Route requests
/**TO DO
 * setup login controller and route
 * setup symptom input data encryption with user passwordHash as key for storage after ICD API access
 */
app.use('/public/login', loginRouter)
app.use('/public/signup', signupRouter)
app.use('/api/protected/symptoms', symptomCheckerRouter)

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)

// Error handlers
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// export to index
module.exports = app
