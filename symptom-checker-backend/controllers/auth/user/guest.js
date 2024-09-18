// security context libraries
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
// utils
const logger = require('../../../utils/logger')
const userAuthenticator = require('../../../utils/userAuth')
// database schema
const User = require('../../../database/models/user')


exports.createGuestUser = async(request, response) => {
    try {
        // register guest user
        const guestId = crypto.randomUUID().toString()
        const randomPassword = crypto.randomBytes(32).toString('base64')
        const saltRounds = 10
        const guestPasswordHash = await bcrypt.hash(randomPassword, saltRounds)
        const guestUsername = `guest-${guestId}`
        const guestUser = new User({
            username: guestUsername,
            passwordHash: guestPasswordHash
        })
        const savedGuest = await guestUser.save()
        
        // Generate JWT and set response cookie
        const guestToken = userAuthenticator.generateAuthToken(savedGuest)
        userAuthenticator.setAuthToken(response, guestToken)

        return response
            .status(200)
            .send({ 
                username: savedGuest.username, 
                registrationTime: savedGuest.registeredAt 
            })
    } catch (error) {
        logger.error('ERROR during Guest User creation : ', error)
        return response
            .status(500)
            .json({ error: 'Internal Server Error' })
    }
}
