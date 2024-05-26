const Users = require("../Modals/users");
const OtpModel = require("../Modals/otpModel");
const { ObjectId } = require("mongodb");
const { getToken } = require("../Services/authentication");
const { verifyToken } = require("../Services/authentication");

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
      return res.status(200).json({
        access_token,
        message: "success",
      });
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

const uploadProfileAndStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const profilePic = req.file
      ? {
          filename: req.file.filename,
          path: req.file.path,
        }
      : null;
    console.log("file is :", profilePic);
    console.log("status is :", status);
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    if (status && profilePic) {
      await Users.findOneAndUpdate(
        { username: verified.username },
        { status, filename: profilePic.filename, path: profilePic.path }
      );
      return res
        .status(200)
        .json({ success: true, message: "status and profile pic updated" });
    }
    if (profilePic) {
      await Users.findOneAndUpdate(
        { username: verified.username },
        { filename: profilePic.filename, path: profilePic.path }
      );
      return res
        .status(200)
        .json({ success: true, message: "profile pic updated" });
    }
    if (status) {
      await Users.findOneAndUpdate({ username: verified.username }, { status });
      return res.status(200).json({ success: true, message: "status updated" });
    }
    if (!status && !profilePic) {
      return res
        .status(400)
        .json({ success: false, message: "status or profile pic missing" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    let userProfile = await Users.findOne({ username: verified.username });

    let resp = {
      profilePic: userProfile.filename,
      status: userProfile.status,
      username: userProfile.username,
      emailId: userProfile.emailId,
    };

    return res.status(200).json({ success: true, ...resp });
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
    if (genreName.length === 0 && !username) {
      return res.status(400).json({
        success: false,
        message: "Either provide username or genre to search",
      });
    }
    if (username && genreName.length > 0) {
      const query = {
        username: new RegExp(`^${username}`),
        adviceGenre: { $in: genreName },
        ...(lastId && { _id: { $gt: lastId } }),
      };
      const allUsers = await Users.find(query).sort({ _id: 1 }).limit(limit);
      if (allUsers) {
        console.log("bc", allUsers);
        let newData = allUsers.map((value) => {
          return {
            username: value.username,
            adviceGenre: value.adviceGenre,
            status: value.status,
            pic: value.filename,
          };
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
          } else {
            response.lastId = "";
          }

          return res.status(200).json(response);
        }
      } else {
        return res.status(404).json({
          success: false,
          message:
            "No users found. Try changing the genre or check the username",
        });
      }
    }
    if (username) {
      const query = {
        username: new RegExp(`^${username}`),
        ...(lastId && { _id: { $gt: lastId } }),
      };
      console.log("inside only username");
      const allUsers = await Users.find(query).sort({ _id: 1 }).limit(limit);
      console.log("allUsers :", allUsers);
      let newData = allUsers.map((value) => {
        return {
          username: value.username,
          adviceGenre: value.adviceGenre,
          status: value.status,
          pic: value.filename,
        };
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
        } else {
          response.lastId = "";
        }

        res.status(200).json(response);
      } else {
        return res.status(404).json({
          success: false,
          message:
            "No users found. Try changing the genre or check the username",
        });
      }
    }
    if (genreName.length > 0) {
      const query = {
        adviceGenre: { $in: genreName },
        ...(lastId && { _id: { $gt: lastId } }),
      };
      const allUsers = await Users.find(query).sort({ _id: 1 }).limit(limit);
      // .toArray(); // Ensure documents are returned in ascending order by _id

      let newData = allUsers.map((value) => {
        return {
          username: value.username,
          adviceGenre: value.adviceGenre,
          status: value.status,
          pic: value.filename,
        };
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
        } else {
          response.lastId = "";
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
  uploadProfileAndStatus,
  getUserProfile,
};
