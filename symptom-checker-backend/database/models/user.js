const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { // ValidationError, response code 400
        type: String,
        minLength: 3,
        required: true,
        unique: true,
    },  
    passwordHash: { // validation in controllers/signup
        type: String,
        select: false,  // Exclude by default
    },   
    diagnosis: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Diagnosis'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// export to controllers/login
module.exports = mongoose.model('User', userSchema)