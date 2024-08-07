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
const userAuthRouter = require('./routes/userAuthRouter')
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
 * DEBUG-Token renewal schedule (1hour) not working
 * FEAT-encrypt symptom data, user data with local DB_SECRET key for storage
 * FEAT-Refine search results : to address all symptoms, to remove < 0 score results
 * TEST-Unit tests for user auth, api auth, symptomChecker requests
**/

app.use('/public/auth', userAuthRouter)
app.use('/api/protected/symptoms', symptomCheckerRouter)

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)

// Error handlers
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// export to index
module.exports = app
