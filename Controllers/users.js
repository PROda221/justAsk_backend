const Users = require("../Modals/users");
const OtpModel = require("../Modals/otpModel");
const { getToken } = require("../Services/authentication");

const createAccount = async (req, res) => {
  try {
    const { username, password, emailId, adviceGenre } = req.body;
    if (!username || !password || !emailId || !adviceGenre) {
      return res
        .status(400)
        .json({
          message: "either username, pass or email or genres are missing",
        });
    }
    await Users.create({ username, password, emailId, adviceGenre });
    return res.status(200).json({ message: "Account created!" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "some error occured : " + err.message });
  }
};

const loginAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "either username, pass is missing" });
    }
    const resultedUser = await Users.matchPassword(username, password)
    if (resultedUser) {
      const access_token = getToken(resultedUser);
      return res.status(200).json({ access_token, message: "success" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const changePass = async (req, res) => {
  try {
    const { emailId, password, otp } = req.body;
    if (!password) {
      return res.status(400).json({ message: "password is missing" });
    } else if (!emailId) {
      return res.status(400).json({ message: "emailId is missing" });
    }
    const otpVerification = await OtpModel.findOne({ emailId, otp });
    if (otpVerification.verified) {
      await OtpModel.findOneAndDelete({ emailId, otp });
      await Users.findOneAndUpdate({ emailId }, { password });
      return res
        .status(200)
        .json({ success: true, message: "password updated successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "otp not verified" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAccount,
  loginAccount,
  changePass,
};
