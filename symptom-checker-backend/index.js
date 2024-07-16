const app = require('./app')
const config = require('./utils/config')

// listen to network port
app.listen(config.PORT, () => {
    console.log(`Server running at http://localhost:${config.PORT}`)
})