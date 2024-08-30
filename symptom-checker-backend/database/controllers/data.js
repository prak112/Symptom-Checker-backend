// schemas
const User = require('../models/user')
const Symptom = require('../models/symptom')

/** TO DO - 
 * DONE - create /guest route and controller
 * DONE - use authentication middleware for login handling
 * DONE - refactor manageDatabase
    * resolves repetition of Guest User creation for every request from same session
 * DONE - Update Database schema in workflow 
    * (Thanks to Pieces! GitHub Copilot sucks!)
 * DONE - DEBUG - Storage issue with user.id in Symptom object
 */

exports.manageDatabase = async(user, diagnosisDataArray) => {
try {
        // get user
        console.log('User Information BEFORE : ', user)
        // update Symptom collection with user object id and symptom data
        const userDiagnosis = new Symptom({
            diagnosis: diagnosisDataArray,
            user: user.id
        })
        const savedDiagnosis = await userDiagnosis.save()
        console.log('User Diagnosis : ', savedDiagnosis)

        // update User collection with symptom object id
        user.diagnosis = user.diagnosis.concat(savedDiagnosis._id)
        await user.save()
        console.log('User Information AFTER : ', user)

        return true
    } catch (error) {
        console.error('ERROR managing Database : ', error)
        throw error;
    }
}


