const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minLength: 3,
        required: true,
        unique: true,
    },  // ValidationError response code 400
    passwordHash: String,   // validation in controllers/signup
    symptom: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Symptoms'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash  // never display hashed password
    }
})

// export to controllers/login
module.exports = mongoose.model('User', userSchema)