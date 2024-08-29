// const mongoose = require('mongoose')

// // Sub-schemas for diagnosis
// const resultSchema = new mongoose.Schema({
//     label: {
//         type: [String],
//     },
//     score: {
//         type: [Number],
//     },
//     url: {
//         type: [String]
//     }
// })
// const topResultSchema = new mongoose.Schema({
//     label: {
//         type: String,
//         required: true,
//     },
//     score: {
//         type: Number,
//         required: true,
//     },
//     title: {
//         type: String,
//         required: true,
//     },
//     detail: {
//         type: String,
//         required: true,
//     },
//     url: {
//         type: String,
//         required: true,
//     }
// })

// // Main schema - diagnosis
// const diagnosisSchema = new mongoose.Schema({
//     diagnosisData : {
//         symptoms: {
//             type: String,
//             required: true
//         },
//         topResult: {
//             type: topResultSchema,
//             required: true
//         },
//         includedResults: {
//             type: resultSchema,
//         },
//         excludedResults: {
//             type: resultSchema,
//         }
//     }   
// })

// // Symptom collection schema
// const symptomSchema = new mongoose.Schema({
//     diagnosis: {
//         type: [diagnosisSchema],
//         required: true
//     },
//     user:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }
// })

// // transform DB output fields for relevant data
// symptomSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })

// // export to controllers/symptomChecker
// module.exports = mongoose.model('Symptom', symptomSchema )

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    topResult: { type: topResultSchema, required: true },
    includedResults: { type: resultSchema, required: true },
    excludedResults: { type: resultSchema, required: true }
});

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
