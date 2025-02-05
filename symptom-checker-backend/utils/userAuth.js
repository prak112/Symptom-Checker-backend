const jwt = require('jsonwebtoken')
const secrets = require('./secrets')

/**
 * Generates an authentication token(JWT) for a registered user.
 * 
 * @param {Object} registeredUser - The registered user object.
 * @param {string} registeredUser.username - The username of the registered user.
 * @param {string} registeredUser.id - The ID of the registered user.
 * @returns {string} The generated authentication token.
 */
function generateAuthToken(registeredUser) {
    const userToAuthenticate = {
        username: registeredUser.username,
        id: registeredUser._id
    }
    // generate 2 hours valid JWT 
    const token = jwt.sign(
        userToAuthenticate,
        secrets.user_secret,
        {
            expiresIn: 2 * 60 * 60 // seconds
        }
    )
    return token
}

/**
 * Sets the authentication token(JWT) in the response cookie.
 * 
 * @param {Object} response - The response object.
 * @param {string} token - The authentication token.
 * @returns {void}
 */
function setAuthToken(response, token){
    response.cookie('auth_token', token, {
        httpOnly: true,
        secure: false, // true if https
        maxAge: 2 * 60 * 60 * 1000, // match token expiresIn (milliseconds)
        sameSite: 'strict'  // mitigate CSRF attacks
    })
}


module.exports = {
    generateAuthToken,
    setAuthToken,
}