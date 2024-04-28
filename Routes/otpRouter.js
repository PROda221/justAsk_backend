const express = require('express')
const {sendOTP, verifyOtp} = require('../Controllers/otpController')

const otpRouter = express.Router()

otpRouter.post('/send', sendOTP)
otpRouter.post('/verify', verifyOtp)



module.exports = {
    otpRouter
}