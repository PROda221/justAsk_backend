const Users = require("../Modals/users");
const OtpModel = require("../Modals/otpModel");
const { ObjectId } = require("mongodb");
const { getToken } = require("../Services/authentication");
const {verifyToken} = require('../Services/authentication')

const checkAccount = async (req, res) => {
  try {
    const { username, password, emailId } = req.body;
    if (!username || !password || !emailId) {
      return res.status(400).json({
        success: false,
        message: "either username, pass or email or genres are missing",
      });
    } else {
      const findUser = await Users.findOne({ username });
      if (findUser) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
      const findEmail = await Users.findOne({ emailId });
      if (findEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
      return res
        .status(200)
        .json({ success: true, message: "This is new user" });
    }
  } catch (err) {
    return res.status(500).json({ success: true, message: err });
  }
};

const createAccount = async (req, res) => {
  try {
    const { username, password, emailId, adviceGenre } = req.body;
    if (!username || !password || !emailId || !adviceGenre) {
      return res.status(400).json({
        success: false,
        message: "either username, pass or email or genres are missing",
      });
    }
    await Users.create({ username, password, emailId, adviceGenre });
    return res.status(200).json({ success: true, message: "Account created!" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "some error occured : " + err.message });
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
    const resultedUser = await Users.matchPassword(username, password);
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

const searchUsers = async (req, res) => {
  try {
    const { genreName, username } = req.body;
    const limit = parseInt(req.body.limit) || 10;
    const lastId = req.body.lastId
      ? ObjectId.createFromHexString(req.body.lastId)
      : null;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    if (!genreName && !username) {
      return res.status(400).json({
        success: false,
        message: "Either provide username or genre to search",
      });
    }
    if (username && genreName) {
      const user = await Users.findOne({ username, adviceGenre: genreName });
      if (user) {
        return res.status(200).json({
          success: true,
          data: [{ username: user.username, adviceGenre: user.adviceGenre }],
        });
      } else {
        return res.status(404).json({
          success: false,
          message:
            "No users found. Try changing the genre or check the username",
        });
      }
    }
    if (username) {
      const user = await Users.findOne({ username });
      if (user) {
        return res.status(200).json({
          success: true,
          data: [{ username: user.username, adviceGenre: user.adviceGenre }],
        });
      } else {
        return res.status(404).json({
          success: false,
          message:
            "No users found. Try changing the genre or check the username",
        });
      }
    }
    if (genreName) {
      const query = {
        adviceGenre: genreName,
        ...(lastId && { _id: { $gt: lastId } }),
      };
      const allUsers = await Users.find(query).sort({ _id: 1 }).limit(limit);
      // .toArray(); // Ensure documents are returned in ascending order by _id

      let newData = allUsers.map((value) => {
        return { username: value.username, adviceGenre: value.adviceGenre };
      });

      if (allUsers) {
        const response = {
          success: true,
          limit,
          data: newData,
        };

        // Include the _id of the last document in the current page
        if (allUsers.length > 0) {
          response.lastId = allUsers[allUsers.length - 1]._id;
        }

        res.status(200).json(response);
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAccount,
  loginAccount,
  changePass,
  checkAccount,
  searchUsers,
};
