const Users = require("../Modals/users");
const BlockedUsers = require("../Modals/blockedUsersModel");
const { ObjectId } = require("mongodb");
const { verifyToken } = require("../Services/authentication");
const {redisClient} = require('../Services/redisInstance')
const {get, set} = require('../Services/blockedCacheLocal')

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

const multiUnblock = async (req, res) => {
  try {
    const { blocked } = req.body;
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
    if (!blocked || blocked.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide usernames you want to unblock",
      });
    }

    // Remove all blocked users for the current user in MongoDB
    await BlockedUsers.deleteMany({
      blocker: verified.username,
      blocked: { $in: blocked },
    });

    // Remove all names from the Redis set in one call
    const redisKey = `blockedUsers:${verified.username}`;
    await redisClient.srem(redisKey, ...blocked);

    // Set values in parallel
    const setOps = blocked.map(user => set(`${verified.username}-${user}`, false)); // Assuming `set` is a promise-based function
    await Promise.all(setOps);

    return res
      .status(200)
      .json({ success: true, message: "Users unblocked successfully!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


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

    let blockedUser = await Users.findOne({ username: blocked });

    await BlockedUsers.create({ blocker: verified.username, blocked, blockedImg: blockedUser.filename });

    await redisClient.sadd(`blockedUsers:${verified.username}`, blocked);
    set(`${verified.username}-${blocked}`, true)

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

    await redisClient.srem(`blockedUsers:${verified.username}`, blocked);
    set(`${verified.username}-${blocked}`, false)

    return res
      .status(200)
      .json({ success: true, message: "User unblocked successfully!" });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const isUserBlocked = async (blocker, blocked) => {
  try {
    const cacheKey = `${blocker}-${blocked}`;
    let isBlockedLocal = get(cacheKey);
    if(isBlockedLocal === undefined){
      const isBlockedRedis = await redisClient.sismember(`blockedUsers:${blocker}`, blocked);
      set(cacheKey, isBlockedRedis);
      return isBlockedRedis === 1; // Returns true if blocked, false if not
    }
    return isBlockedLocal;
  } catch (error) {
    console.error('Error checking blocked status:', error);
    throw error;
  }
};

module.exports = {
  getAllBlockedUsers,
  addBlockedUser,
  unblockUser,
  multiUnblock,
  isUserBlocked
};
