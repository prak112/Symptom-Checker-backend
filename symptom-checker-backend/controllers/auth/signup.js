//const signupRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../../models/user')

exports.registerUser = async(request, response) => {
    try{
        const { username, password } = request.body
        console.log('\nUsername to register: ', username)

        // validate password
        const specialChars = /[\W_]/
        if(!password || password.length < 6 || !specialChars.test(password)){
            return response
                .status(400)
                .send({ 
                    error: "Password must be greater than 6 characters. Must include special characters" 
                })
        }

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)
        const userToRegister = new User({
            username: username,
            passwordHash: passwordHash
        })
        const savedUser = await userToRegister.save()
        response.status(201).json(savedUser)
    }
    catch(error){
        console.error('Error during registration: ', error)
        return response
            .status(500)
            .json({ error: 'Internal Server Error' })
    }
}