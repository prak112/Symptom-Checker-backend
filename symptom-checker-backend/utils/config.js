const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const USER_SECRET = process.env.USER_SECRET
const DB_SECRET = process.env.DB_SECRET
const OLD_DB_SECRET = process.env.OLD_DB_SECRET
const WEB_FRONTEND_DEV = process.env.WEB_FRONTEND_DEV
const WEB_FRONTEND_PROD = process.env.WEB_FRONTEND_PROD
const MOBILE_FRONTEND = process.env.MOBILE_FRONTEND
const ADMIN_FRONTEND = process.env.ADMIN_FRONTEND

module.exports = { 
    CLIENT_ID, 
    CLIENT_SECRET, 
    PORT, 
    MONGODB_URI, 
    USER_SECRET,
    DB_SECRET,
    OLD_DB_SECRET,
    WEB_FRONTEND_DEV,
    WEB_FRONTEND_PROD,
    MOBILE_FRONTEND,
    ADMIN_FRONTEND,
 }