const express = require('express')
const {otpRouter} = require('../Routes/otpRouter')
const {commentRouter} = require('../Routes/commentRoute')
const {uploadAndCheckFile} = require('../Services/multerConfig')
const {createAccount, loginAccount, changePass, checkAccount, searchUsers, uploadProfileAndStatus, getUserProfile} = require('../Controllers/users')
const {fetchAllUsers, fetchProfile} = require('../Controllers/chatController')
const { blockedUsersRouter } = require('./blockedUsersRoute')

const userRouter = express.Router()

userRouter.post('/signUp',createAccount)
userRouter.post('/checkUser', checkAccount)
userRouter.post('/login',loginAccount)
userRouter.use('/otp', otpRouter)
userRouter.post('/forgotPass', changePass)
userRouter.get('/allUsers', fetchAllUsers)
userRouter.get('/profile', fetchProfile)
userRouter.post('/search', searchUsers)
userRouter.post('/upload', uploadAndCheckFile, uploadProfileAndStatus)
userRouter.get('/getProfile', getUserProfile)
userRouter.use('/feedback', commentRouter)
userRouter.use('/blocked', blockedUsersRouter )



module.exports = {
    userRouter
}