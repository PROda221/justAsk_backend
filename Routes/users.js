const express = require('express')
const {otpRouter} = require('../Routes/otpRouter')
const {commentRouter} = require('../Routes/commentRoute')
const {uploadAndCheckFile} = require('../Services/multerConfig')
const {createAccount, loginAccount, changePass, checkAccount, searchUsers, uploadProfileAndStatus, getUserProfile, googleLogin, checkUsername} = require('../Controllers/users')
const {fetchAllUsers, fetchProfile} = require('../Controllers/chatController')
const { blockedUsersRouter } = require('./blockedUsersRoute')
const {getDeviceToken} = require('../Controllers/notificationControler')

const userRouter = express.Router()

userRouter.get('/ping', (req, res) => res.send('pong'))
userRouter.post('/signUp',createAccount)
userRouter.post('/checkUser', checkAccount)
userRouter.post('/login',loginAccount)
userRouter.post('/googleLogin',googleLogin)
userRouter.post('/checkUsername',checkUsername)
userRouter.use('/otp', otpRouter)
userRouter.post('/forgotPass', changePass)
userRouter.get('/allUsers', fetchAllUsers)
userRouter.post('/profile', fetchProfile)
userRouter.post('/search', searchUsers)
userRouter.post('/upload', uploadAndCheckFile, uploadProfileAndStatus)
userRouter.get('/getProfile', getUserProfile)
userRouter.use('/feedback', commentRouter)
userRouter.use('/blocked', blockedUsersRouter )
userRouter.post('/notificationToken', getDeviceToken)



module.exports = {
    userRouter
}