// utilities
const logger = require('./logger')
const config = require('./config')
// security context libraries
const jwt = require('jsonwebtoken')
// database schema
const User = require('../database/models/user')

// load Middleware (VERY PARTICULAR ORDER)
const morgan = require('morgan')    // request logger
const requestLogger = morgan('dev')

// assign JWT from request headers to request parameters
const tokenExtractor = (request, response, next) => {
    request.token = request.cookies['auth_token']
    next()
}

// validate user's JWT to prevent overlap/misinterpretation of information input by user 
// used to validate requests
const userExtractor = async(request, response, next) => {
    try{
        const decodedToken = jwt.verify(request.token, config.USER_SECRET)
        const user = await User.findById(decodedToken.id)
        if(!user){
            return response
                .status(401)
                .json({error: 'User not found. Authentication Failed.'})
        }
        request.user = user
        next()
    } catch(error) {
        logger.error('ERROR during User identification : ', error)
        response
            .status(401)
            .json({error: 'Unregistered User. Invalid Token. User authentication failed.' })
    }
}


// load before-last Middleware
const unknownEndpoint = (request, response) => {
    response.status(404).send({error : 'Unknown Endpoint'})
}

// Requests error handler - ALWAYS loaded last
const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if(error.name === 'CastError'){
        response.status(400).send({ error: 'Malformed request syntax / Invalid request framing' })
    }
    else if(error.name === 'ValidationError'){
        response.status(400).send({ error: error.message })
    }
    else if(error.name === 'ReferenceError'){
        response.status(500).send({ error: error.message })
    }
    else if(error.name === 'TypeError'){
        response.status(500).send({ error: error.message })
    }
    next(error)
}

// export to app
module.exports = { 
    requestLogger, 
    tokenExtractor, 
    userExtractor, 
    unknownEndpoint, 
    errorHandler }