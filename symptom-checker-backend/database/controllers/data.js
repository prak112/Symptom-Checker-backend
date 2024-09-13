// schema
const Symptom = require('../models/symptom')


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


