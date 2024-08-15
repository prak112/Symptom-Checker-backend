const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('../../utils/config')
const User = require('../../models/user')

exports.authenticateUser = async(request, response) => {
    try {
        const { username, password } = request.body
        const registeredUser = await User.findOne({username: username})
        if(!registeredUser){
            console.error('User does not exist. Signup for access.')
            return response
                .status(401)
                .json({ error: 'User does not exist. Signup for access.' })
        }
        const isPassword = password === null 
            ? false
            : bcrypt.compare(password, registeredUser.passwordHash)
        if(!isPassword){
            return response
                .status(401)
                .json({ error: 'Invalid Credentials. Check and enter again.' })
        }
    
        // if valid username and password
        const userToAuthenticate = {
            username: registeredUser.username,
            id: registeredUser.id
        }
        // generate 2 hours valid JWT 
        const token = jwt.sign(
            userToAuthenticate,
            config.USER_SECRET,
            {
                expiresIn: 2 * 60 * 60
            }
        )
    
        // wrap JWT in httpCookie to be passed in request.headers
        response.cookie('auth_token', token, {
            httpOnly: true,
            secure: false, // true if https
            maxAge: 2 * 60 * 60, // match token expiresIn
            sameSite: 'strict'  // mitigate CSRF attacks
        })
        response
            .status(200)
            .send({username: registeredUser.username})
    } 
    catch (error){
        console.error('Error during Login: ', error)
        return response
            .status(500)
            .json({ error: 'Internal Server Error.' })
    }
}
