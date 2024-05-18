const express = require('express')
const {otpRouter} = require('../Routes/otpRouter')
const {createAccount, loginAccount, changePass, checkAccount, searchUsers} = require('../Controllers/users')
const {fetchAllUsers, fetchProfile} = require('../Controllers/chatController')

const userRouter = express.Router()

userRouter.post('/signUp',createAccount)
userRouter.post('/checkUser', checkAccount)
userRouter.post('/login',loginAccount)
userRouter.use('/otp', otpRouter)
userRouter.post('/forgotPass', changePass)
userRouter.get('/allUsers', fetchAllUsers)
userRouter.get('/profile', fetchProfile)
userRouter.post('/search', searchUsers)



module.exports = {
    userRouter
}