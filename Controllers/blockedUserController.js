const Users = require("../Modals/users");
const BlockedUsers = require("../Modals/BlockedUsersModel");
const { ObjectId } = require("mongodb");
const { verifyToken } = require("../Services/authentication");

const getAllBlockedUsers = async (req, res) => {
  try {
    console.log('params :', req.query)
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId
      ? ObjectId.createFromHexString(req.query.lastId)
      : null;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    const query = {
      blocker: verified.username,
      ...(lastId && { _id: { $gt: lastId } }),
    };
    const blockedDocs = await BlockedUsers.find(query)
      .sort({ _id: 1 })
      .limit(limit);

    if (blockedDocs) {
      const response = {
        success: true,
        limit,
        data: blockedDocs,
      };

      // Include the _id of the last document in the current page
      if (blockedDocs.length > 0) {
        response.lastId = blockedDocs[blockedDocs.length - 1]._id;
      }

      res.status(200).json(response);
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addBlockedUser = async (req, res) => {
  try {
    const { blocked } = req.body;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    if (!blocked) {
      return res.status(400).json({
        success: false,
        message: "Provide username you want to block",
      });
    }

    await BlockedUsers.create({ blocker: verified.username, blocked });

    return res
      .status(200)
      .json({ success: true, message: "User blocked successfully!" });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { blocked } = req.body;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }
    if (!blocked) {
      return res.status(400).json({
        success: false,
        message: "Provide username you want to unblock",
      });
    }
    await BlockedUsers.deleteOne({ blocker: verified.username, blocked });

    return res
      .status(200)
      .json({ success: true, message: "User unblocked successfully!" });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllBlockedUsers,
  addBlockedUser,
  unblockUser,
};
