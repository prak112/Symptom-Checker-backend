// security context libraries
const bcrypt = require('bcryptjs')
// utilities
const logger = require('../../../utils/logger')
const authHandler = require('../../../utils/userAuth')
// database scehema
const User = require('../../../database/models/user')


exports.authenticateUser = async(request, response) => {
    try {
        const { username, password } = request.body
        const registeredUser = await User.findOne({username: username}).select('+passwordHash')
        if(!registeredUser){
            logger.error('User does not exist. Signup for access.')
            return response
                .status(401)
                .json({ error: 'User does not exist. Signup for access.' })
        }
        const isPassword = await bcrypt.compare(password, registeredUser.passwordHash)        
        if(!isPassword){
            return response
                .status(401)
                .json({ error: 'Invalid Credentials. Check and enter again.' })
        }

        // if valid username and password
        const token = authHandler.generateAuthToken(registeredUser)    
        // wrap JWT in httpCookie to be passed in request.headers
        authHandler.setAuthToken(response, token)

        return response
            .status(200)
            .send({
                username: registeredUser.username, 
                registrationTime: new Date(registeredUser.registeredAt).toLocaleString()
            })
    } catch (error) {
        logger.error('Error during Login: ', error)
        return response
            .status(500)
            .json({ error: 'Internal Server Error.' })
    }
}
