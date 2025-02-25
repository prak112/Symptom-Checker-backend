const crypto = require('crypto');
const logger = require('./logger')
const Symptom = require('../database/models/symptom')
const secrets = require('./secrets')


const algorithm = secrets.algorithm
const key = secrets.key
const iv = secrets.iv

function encryptData(record) {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(record, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

function decryptData(encryptedRecord) {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedRecord, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}


// TODO - Verify Recursive function to account for every field in fieldsToEncrypt list


/**
 * Recursively encrypts or decrypts specified fields in an object.
 * 
 * @param {Object} obj - The object to process.
 * @param {Array} fieldsToEncrypt - The fields to encrypt/decrypt.
 * @param {Function} processFunc - The function to apply (encrypt/decrypt).
 */
function processFields(obj, fieldsToEncrypt, processFunc) {
    for (const key in obj) {
        if (fieldsToEncrypt.includes(key) && typeof obj[key] === 'string') {
            obj[key] = processFunc(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            processFields(obj[key], fieldsToEncrypt, processFunc);
        }
    }
}

/**
 * Re-encrypts the encrypted secrets of all symptom records in the database periodically when db_secret is updated.
 * 
 * This function retrieves all encrypted symptom records from the database, decrypts and re-encrypts the records by using updated db_secret.
 * Logs the status of the process upon completion or interruption due to an error.
 *  
 * @async
 * @function reEncryptData
 * @returns {Promise<void>} Resolves when re-encryption process is complete.
 * @throws logs error message if error occurs during re-encryption process.
 */
async function reEncryptData() {
    try {
        const records = await Symptom.find();
        const fieldsToEncrypt = ['symptom', 'analysis', 'label', 'score', 'title', 'detail', 'url'];

        for (const record of records) {
            processFields(record.toObject(), fieldsToEncrypt, decryptData);
            processFields(record.toObject(), fieldsToEncrypt, encryptData);
            await record.save();
        }
        logger.info('Data re-encrypted successfully');
    } catch (error) {
        logger.error('ERROR re-encrypting data:', error);
    }
}



module.exports = { decryptData, encryptData, reEncryptData }

