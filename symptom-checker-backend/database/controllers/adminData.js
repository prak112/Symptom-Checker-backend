// data models
const User = require('../models/user')
const Symptom = require('../models/symptom')

exports.getAllUsers = async(request, response, next) => {
  try {
    const users = await User
      .find(
      {}, 
      { _id: 0, username: 1, registeredAt: 1 }
      )
    
    return response.json(users)
  } catch (error) {
    console.error(`ERROR fetching users from database.\nERROR: ${error}`);
    throw error;
    // next();
  }
}

exports.getAllDiagnosis = async(request, response, next) => {
  try {
    const diagnosis = await Symptom
      .find({})
      .populate({
        path: 'diagnosis',
        model: 'Diagnosis', // reference in schema
          select: {
            symptom: 1,
            analysis: 1,
            diagnosedAt: 1,
            topResult: 1,
            includedResults: 0,
            excludedResults: 0,
            _id: 0,
            diagnosedAt: 1,
          }
        }
      );
    
    // const diagnosis = await Symptom
    //   .find({},
    //     {

    //     }
    //   )

    return response.json(diagnosis)
  } catch (error) {
    console.error(`ERROR fetching diagnosis from database.\nERROR: ${error}`);
    throw error;
  }
}