const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-Schemas
const resultSchema = new Schema({
    label: [String],
    score: [Number],
    url: [String]
});

const topResultSchema = new Schema({
    label: String,
    score: Number,
    title: String,
    detail: String,
    url: String
});

const diagnosisDataSchema = new Schema({
    symptom: { type: String, required: true },
    analysis: { type: String, required: true },
    diagnosedAt: { type: Date, default: Date.now },
    topResult: { type: topResultSchema, required: true },
    includedResults: { type: resultSchema, required: true },
    excludedResults: { type: resultSchema, required: true }
});

// Main schema
const diagnosisArraySchema = new Schema({
    diagnosis: { type: [diagnosisDataSchema], required: true },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// transform DB output fields for relevant data
diagnosisArraySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// export to controllers/symptomChecker
module.exports = mongoose.model('Diagnosis', diagnosisArraySchema )
