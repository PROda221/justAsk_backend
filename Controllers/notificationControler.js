const Users = require("../Modals/users");
const { ObjectId } = require("mongodb");
const { verifyToken } = require("../Services/authentication");

const getDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }

    const updatedDeviceToken = await Users.updateOne(
      { username: verified.username },
      { deviceToken }
    );
    if (updatedDeviceToken) {
      console.log("updatedDeviceToken :", updatedDeviceToken);
      return res
        .status(200)
        .json({ success: true, message: "device token added" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDeviceToken,
};
