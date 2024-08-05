const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const USER_SECRET = process.env.USER_SECRET
const DB_SECRET = process.env.DB_SECRET
const OLD_DB_SECRET = process.env.OLD_DB_SECRET

module.exports = { 
    CLIENT_ID, 
    CLIENT_SECRET, 
    PORT, 
    MONGODB_URI, 
    USER_SECRET,
    DB_SECRET,
    OLD_DB_SECRET
 }