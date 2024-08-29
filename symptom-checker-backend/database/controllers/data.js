// schemas
const User = require('../models/user')
const Symptom = require('../models/symptom')
// security context libraries
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

/** TO DO - 
 * add createGuestUser in middleware.js
    * preserve guest user UUID in request.user
    * resolves repetition of Guest User creation for every request from same session
 * DONE - Update Database schema in workflow (Thanks to Pieces! GitHub Copilot sucks!)
**/

exports.manageDatabase = async(request, diagnosisDataArray) => {
try {
        // find user
        const foundUser = await User.findOne({ username: request.user }) ? true : false
    
        if(!foundUser) {
            console.log('Creating Guest User...')

            // create guest user with similar security practices as registered user
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
            // save the guest as current user in server
            request.user = savedGuest.username
            console.log('Created Guest User and added to request.user...')

            // update Symptom collection with user object id and symptom data
            const guestSymptoms = new Symptom({
                diagnosis: diagnosisDataArray,
                user: savedGuest._id
            })
            const savedSymptoms = await guestSymptoms.save()
            console.log('Saved Guest Symptoms to DB...')


            // update User collection with symptom object id
            savedGuest.diagnosis = savedGuest.diagnosis.concat(savedSymptoms._id)
            await savedGuest.save()
            console.log('GUEST User Information : ', savedGuest)
            console.log('GUEST User Symptoms : ', guestSymptoms)
            
        } else {
            // get user if found
            const existingUser = await User.findOne({ username: request.user })
            // update Symptom collection with user object id and symptom data
            const userSymptoms = new Symptom({
                diagnosis: diagnosisDataArray,
                user: existingUser._id
            })
            const savedSymptoms = await userSymptoms.save()
            console.log('EXISTING User Symptoms : ', savedSymptoms)
    
            // update User collection with symptom object id
            existingUser.symptom = existingUser.symptom.concat(savedSymptoms._id)
            await existingUser.save()
            console.log('EXISTING User Information : ', existingUser)
        }

        return true
    } catch (error) {
        console.error('ERROR managing Database : ', error)
        throw error;
    }
}


