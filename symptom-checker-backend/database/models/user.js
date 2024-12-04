const mongoose = require('mongoose')
const { formatISODateToCustom } = require('../utils/formatDate')

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
    registeredAt: {
        type: Date,
        default: Date.now,  // ISO8601 format UTC, ex. 2024-09-18T15:46:17.758Z
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
        returnedObject.id = returnedObject._id?.toString()
        // returnedObject.registeredAt = formatISODateToCustom(returnedObject.registeredAt)
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// export to controllers/login
module.exports = mongoose.model('User', userSchema)