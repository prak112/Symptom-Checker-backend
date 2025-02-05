const crypto = require('crypto');
const logger = require('./logger')
const Symptom = require('../models/symptom')
const secrets = require('./secrets')


const secret = secrets.secret
const algorithm = secrets.algorithm
const key = secrets.key
const iv = secrets.iv

function encryptData() {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(secret, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

function decryptData(encryptedSecret) {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
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
	const records = await Symptom.find().toArray();
    try {
        for (const record of records) {
            for(const diagnosis of record.diagnosis){
                const decryptedData = decryptData(diagnosis.symptom);
                const reEncryptedData = encryptData(decryptedData);
                diagnosis.symptom = reEncryptedData
            }
            await record.save()
        }
        logger.info('Data re-encrypted successfully');
    } 
    catch (error) {
        logger.error('ERROR re-encrypting data:', error);
    }
}

module.exports = { decryptData, encryptData, reEncryptData }

