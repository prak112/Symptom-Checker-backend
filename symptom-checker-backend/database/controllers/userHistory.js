// schema
const Symptom = require('../models/symptom')
const User = require('../models/user')
// utils
const dateFormatter = require('../utils/formatDate')

exports.getAllDiagnosis = async(request, response) => {
    try {
        const registeredUserDiagnosis = await User.findOne({username: request.user.username})
                                .populate({
                                    path: 'diagnosis',
                                    populate: {
                                        path: 'diagnosis',
                                        model: 'Diagnosis', // reference in schema
                                        select: {
                                            symptom: 1,
                                            analysis: 1,
                                            diagnosedAt: 1,
                                            topResult: 1,
                                            includedResult: 1,
                                            excludedResult: 1
                                        }
                                    }
                                })
    
        return response
            .json(registeredUserDiagnosis)   
    } catch (error) {
        console.error('Error retrieving User diagnosis history : ', error)
        throw error;
    }                     
}


exports.deleteDiagnosisById = async(request, response) => {
    try {
        console.log('Request Body : ', request.body)
        const diagnosisId = request.body.diagnosisId
        const diagnosisToDelete = await Symptom.findById({id: diagnosisId})
        console.log('Diagnosis record : ', diagnosisToDelete)
        const username = request.user.username
        console.log('User info : ', username);
        
        await Symptom.findByIdAndDelete(diagnosisId)
        console.log(`Diagnosis - '${record}'\nDeleted by User - '${username}'`)    

        return response
            .status(204)
            .end()
    } catch (error) {
        console.error('Error deleting User diagnosis : ', error)
        throw error;
    }
}