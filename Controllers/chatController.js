const Users = require("../Modals/users");
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
    if (verified) {
      let response = verified;
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

module.exports = {
  fetchAllUsers,
  fetchProfile,
};
