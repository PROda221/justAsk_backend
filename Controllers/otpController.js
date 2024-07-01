// controllers/otpController.js
const otpGenerator = require("otp-generator");
const OtpModel = require("../Modals/otpModel");
const User = require("../Modals/users");
const { sendVerificationEmail } = require("../Services/sendMailHandler");
const { responseStrings } = require("../Constants/responseStrings");

const sendOTP = async (req, res) => {
  try {
    const { emailId } = req.body;
    // Check if user is already present
    const checkUserPresent = await User.findOne({ emailId });
    if (!checkUserPresent) {
      return res.status(404).json({
        success: false,
        message: responseStrings.sendOtp.emailDosentExist,
      });
    }
    // If user found with provided email
    if (checkUserPresent) {
      let otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      let result = await OtpModel.findOne({ emailId });
      if (result) {
        result = await OtpModel.findOneAndUpdate({ emailId }, { otp });
      } else {
        result = await OtpModel.create({ emailId, otp });
      }
      await sendVerificationEmail(emailId, otp);
      return res.status(200).json({
        success: true,
        message: responseStrings.sendOtp.otpSent,
        otp,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: responseStrings.sendOtp.serverError });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    // Check if user is already present
    const checkUserPresent = await OtpModel.findOne({ emailId, otp });
    // If user found with provided email
    if (checkUserPresent) {
      await OtpModel.findOneAndUpdate({ emailId }, { verified: true });
      return res
        .status(200)
        .json({
          success: true,
          message: responseStrings.verifyOtp.otpVerified,
        });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: responseStrings.verifyOtp.otpIncorrect,
        });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: responseStrings.verifyOtp.serverError });
  }
};

module.exports = {
  sendOTP,
  verifyOtp,
};
