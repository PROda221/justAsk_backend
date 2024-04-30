const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
  verified: {
    type: Boolean,
  }
}, {timestamps: true});

const OtpModel = mongoose.model("OTP", otpSchema);

module.exports = OtpModel;
