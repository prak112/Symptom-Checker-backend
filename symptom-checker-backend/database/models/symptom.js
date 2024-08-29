const mongoose = require('mongoose')

const symptomSchema = new mongoose.Schema({
    symptom: {
        type: String,
        required: true,
        minLength: 5
    },
    diagnosis: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

// transform DB output fields for relevant data
symptomSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// export to controllers/symptomChecker
module.exports = mongoose.model('Symptom', symptomSchema )