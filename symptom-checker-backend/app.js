// Intial setup
const config = require('./utils/config')
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const cors = require('cors')  // cross-origin resource sharing
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const icdAuthController = require('./controllers/auth/api/icdAuthController')
const userAuthRouter = require('./routes/userAuthRouter')
const symptomCheckerRouter = require('./routes/symptomCheckerRouter')


/**TO DO
 * FEAT-User Auth : Setup 'Login as Guest' or store guest users' input as 'guest#random-number'
 * FEAT-Symptoms : Setup MongoDB collection and data storage
 * FEAT-encrypt symptom data, user data with local DB_SECRET key for storage
 * FEAT-Refine search results : to address all symptoms, to remove < 0 score results
 * TEST-Unit tests for user auth, api auth, symptomChecker requests
**/

// Setup MongoDB connection
const mongoose = require('mongoose')
mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('\nConnected to MongoDB 🔗 \n')
    })
    .catch((error) => {
        logger.info('Error connecting to MongoDB!\nERROR: ', error.message)
    })

// Load Middleware
// ICD API authentication middeware
app.use(icdAuthController.authenticate)

// CORS-accepts frontend communication from different origin
app.use(cors({
    origin: 'http://localhost:5173/',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
// json-parser for request body   
app.use(express.json()) 
app.use(middleware.requestLogger)

// Route requests
app.use('/public/auth', userAuthRouter)
app.use('/api/protected/symptoms', symptomCheckerRouter)

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)

// Error handlers
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// export to index
module.exports = app
