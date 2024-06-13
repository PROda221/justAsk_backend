const Users = require("../Modals/users");
const Comments = require("../Modals/commentModel");
const { verifyToken } = require("../Services/authentication");
const ObjectId = require("mongodb").ObjectId;

const fetchAllUsers = async (req, res) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    if (verified) {
      let allUsers = await Users.find({
        _id: { $ne: new ObjectId(verified.id) },
      });
      let response = allUsers.map((values) => {
        return {
          username: values.username,
          id: values._id,
          emailId: values.emailId,
          adviceGenre: values.adviceGenre,
        };
      });
      return res.status(200).json({ success: true, response });
    }
    return res
      .status(403)
      .json({ success: false, message: "User not authorized" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "some error occured : " + err.message });
  }
};

const fetchProfile = async (req, res) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    let { username } = req.body;
    if (verified) {
      let user = await Users.findOne({ username });
      let averageRating = await Comments.aggregate([
        {
          $match: { username },
        },
        {
          $group: {
            _id: "$username",
            averageStars: { $avg: "$rating" },
          },
        },
      ]);
      if (user) {
        let responseObj = {
          success: true,
          userDetails: {
            username: user.username,
            adviceGenre: user.adviceGenre,
            status: user.status,
            profilePic: user.filename,
            averageRating: averageRating ? averageRating : -1,
          },
        };
        return res.status(200).json({ success: true, response: responseObj });
      }
      return res.status(404).json({ success: true, message: "User not found" });
    }
    return res
      .status(403)
      .json({ success: false, message: "User not authorized" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "some error occured : " + err.message });
  }
};

module.exports = {
  fetchAllUsers,
  fetchProfile,
};
