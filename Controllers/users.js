const Users = require("../Modals/users");
const OtpModel = require("../Modals/otpModel");
const Comments = require("../Modals/commentModel");

const { ObjectId } = require("mongodb");
const { responseStrings } = require("../Constants/responseStrings");
const { getToken } = require("../Services/authentication");
const {deleteExistingImage} = require('../Services/multerConfig')
const { verifyToken } = require("../Services/authentication");
const admin = require("firebase-admin");

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        message: responseStrings.googleLogin.idTokenMissing,
      });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    const resultedUser = await Users.findOne({ emailId: email });
    if (resultedUser) {
      const access_token = getToken(resultedUser);
      return res.status(200).json({
        access_token,
        message: "success",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: responseStrings.googleLogin.createAccount,
        googleData: { uid, email, name },
      });
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === responseStrings.loginAccount.incorrectPassCondition
    ) {
      return res.status(404).json({
        success: false,
        message: responseStrings.loginAccount.incorrectPass,
      });
    }

    return res.status(500).json({
      success: false,
      message: responseStrings.loginAccount.serverError,
    });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: responseStrings.checkUsername.usernameMissing,
      });
    }
    const findUser = await Users.findOne({ username });
    if (findUser) {
      return res.status(400).json({
        success: false,
        message: responseStrings.checkUsername.usernameTaken,
      });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: responseStrings.checkUsername.usernameOk,
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: responseStrings.checkUsername.serverError,
    });
  }
};

const checkAccount = async (req, res) => {
  try {
    const { username, password, emailId } = req.body;
    if (!username || !password || !emailId) {
      return res.status(400).json({
        success: false,
        message: responseStrings.checkAccount.fieldsMissing,
      });
    } else {
      const findUser = await Users.findOne({ username });
      if (findUser) {
        return res.status(400).json({
          success: false,
          message: responseStrings.checkAccount.usernameTaken,
        });
      }
      const findEmail = await Users.findOne({ emailId });
      if (findEmail) {
        return res.status(400).json({
          success: false,
          message: responseStrings.checkAccount.emailExists,
        });
      }
      return res
        .status(200)
        .json({ success: true, message: responseStrings.checkAccount.newUser });
    }
  } catch (err) {
    return res.status(500).json({
      success: true,
      message: responseStrings.checkAccount.serverError,
    });
  }
};

const createAccount = async (req, res) => {
  try {
    const { username, password, emailId, adviceGenre } = req.body;
    if (!username || !password || !emailId || !adviceGenre) {
      return res.status(400).json({
        success: false,
        message: responseStrings.createAccount.fieldsMissing,
      });
    }
    await Users.create({ username, password, emailId, adviceGenre });
    return res.status(200).json({
      success: true,
      message: responseStrings.createAccount.accountCreated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: responseStrings.createAccount.serverError,
    });
  }
};

const loginAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: responseStrings.loginAccount.usernamePassMissing,
      });
    }
    const resultedUser = await Users.matchPassword(username, password);
    if (resultedUser) {
      const access_token = getToken(resultedUser);
      return res.status(200).json({
        access_token,
        message: "success",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: responseStrings.loginAccount.accountNotFound,
      });
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === responseStrings.loginAccount.incorrectPassCondition
    ) {
      return res.status(404).json({
        success: false,
        message: responseStrings.loginAccount.incorrectPass,
      });
    }
    return res.status(500).json({
      success: false,
      message: responseStrings.loginAccount.serverError,
    });
  }
};

const changePass = async (req, res) => {
  try {
    const { emailId, password, otp } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ message: responseStrings.changePass.passwordMissing });
    } else if (!emailId) {
      return res
        .status(400)
        .json({ message: responseStrings.changePass.emailMissing });
    }
    const otpVerification = await OtpModel.findOne({ emailId, otp });
    if (otpVerification.verified) {
      await OtpModel.findOneAndDelete({ emailId, otp });
      await Users.findOneAndUpdate({ emailId }, { password });
      return res
        .status(200)
        .json({
          success: true,
          message: responseStrings.changePass.passwordUpdated,
        });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: responseStrings.changePass.otpNotVerified,
        });
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: responseStrings.changePass.serverError,
      });
  }
};

const uploadProfileAndStatus = async (req, res, next) => {
  try {
    const { status, currentPath } = req.body;
    const profilePic = req.file
      ? {
          filename: req.file.filename,
          path: req.file.path,
        }
      : null;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    if(currentPath){
      deleteExistingImage(currentPath)
    }
    if (status && profilePic) {
      await Users.findOneAndUpdate(
        { username: verified.username },
        { status, filename: profilePic.filename, path: profilePic.path }
      );
      let commentUser = await Comments.findOne({
        commentUserId: verified.username,
      });
      if (!commentUser?.commentUserPic) {
        await Comments.findOneAndUpdate(
          { commentUserId: verified.username },
          { commentUserPic: profilePic.filename }
        );
      }

      return res
        .status(200)
        .json({ success: true, message: "status and profile pic updated" });
    }
    if (profilePic) {
      await Users.findOneAndUpdate(
        { username: verified.username },
        { filename: profilePic.filename, path: profilePic.path }
      );
      let commentUser = await Comments.findOne({
        commentUserId: verified.username,
      });
      if (!commentUser?.commentUserPic) {
        await Comments.findOneAndUpdate(
          { commentUserId: verified.username },
          { commentUserPic: profilePic.filename }
        );
      }
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
    let averageRating = await Comments.aggregate([
      {
        $match: { username: verified.username },
      },
      {
        $group: {
          _id: "$username",
          averageStars: { $avg: "$rating" },
        },
      },
    ]);

    let userProfile = await Users.findOne({ username: verified.username });

    let resp = {
      profilePic: userProfile.filename,
      status: userProfile.status,
      username: userProfile.username,
      emailId: userProfile.emailId,
      adviceGenre: userProfile.adviceGenre,
      averageRating: averageRating ? averageRating : -1,
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
      const allUsers = await Users.find(query).sort({ _id: 1 }).limit(limit);
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
  googleLogin,
  checkUsername,
};
