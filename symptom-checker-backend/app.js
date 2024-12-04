// Intial setup
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')  // cross-origin resource sharing
// authentication setup
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const middleware = require('./utils/middleware')
// routers
const icdAuthController = require('./controllers/auth/api/icdAuthController')
const userAuthRouter = require('./routes/userAuthRouter')
const symptomCheckerRouter = require('./routes/symptomCheckerRouter')
const userDataRouter = require('./routes/userDataRouter')
const adminDataRouter = require('./routes/adminDataRouter')
// utilities
const logger = require('./utils/logger')


/**TO DO
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

// CORS - config frontends for secure communication
app.use(cors({
    origin: [
        config.WEB_FRONTEND, 
        config.MOBILE_FRONTEND, 
        config.ADMIN_FRONTEND
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
// json-parser for request body   
app.use(express.json()) 
app.use(middleware.requestLogger)

// authentication middleware
app.use(middleware.tokenExtractor)

// Route requests
app.use('/public/auth', userAuthRouter)
app.use('/api/protected/symptoms', symptomCheckerRouter)
app.use('/api/protected/users', userDataRouter)
app.use('/api/protected/admin', adminDataRouter)

// Error handlers
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// export to index
module.exports = app
