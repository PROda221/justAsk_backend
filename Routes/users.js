const express = require('express')
const {otpRouter} = require('../Routes/otpRouter')
const {createAccount, loginAccount, changePass} = require('../Controllers/users')

const userRouter = express.Router()

userRouter.post('/signUp',createAccount)
userRouter.post('/login',loginAccount)
userRouter.use('/otp', otpRouter)
userRouter.post('/forgotPass', changePass)



module.exports = {
    userRouter
}