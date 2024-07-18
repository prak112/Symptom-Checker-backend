const logger = require('./logger')

// load Middleware (VERY PARTICULAR ORDER)
const morgan = require('morgan')    // request logger
const requestLogger = morgan('dev')

// Request Logger ONLY for development purposes - POST method
// morgan.token('body', (req, res) => JSON.stringify(req.body) );
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

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
module.exports = { requestLogger, unknownEndpoint, errorHandler }