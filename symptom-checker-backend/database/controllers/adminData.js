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
    console.error('ERROR: You do not have access to Admin services.');
    throw error;
    // next();
  }
}