// schema
const User = require('../models/user')


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
                                            topResult: 1,
                                            includedResult: 1,
                                            excludedResult: 1
                                        }
                                    }
                                })
        
        return response.json(registeredUserDiagnosis)   
    } catch (error) {
        console.error('Error retrieving User diagnosis history : ', error)
        throw error;
    }                     
}