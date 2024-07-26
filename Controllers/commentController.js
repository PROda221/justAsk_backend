const Comments = require("../Modals/commentModel");
const Users = require('../Modals/users')
const { verifyToken } = require("../Services/authentication");
const ObjectId = require("mongodb").ObjectId;

const fetchUserFeedbacks = async (req, res) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized!" });
    }

    let { username } = req.body;
    const limit = parseInt(req.body.limit) || 10;
    const lastId = req.body.lastId
      ? ObjectId.createFromHexString(req.body.lastId)
      : null;
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required!" });
    }
    const query = {
      username: username,
      ...(lastId && { _id: { $gt: lastId } }),
    };
    let userFeedbacks = await Comments.find(query)
      .sort({ _id: 1 })
      .limit(limit);

    let newData = userFeedbacks.map((value) => {
      return {
        username: value.username,
        content: value.content,
        commentUserId: value.commentUserId,
        rating: value.rating,
        commentUserPic: value.commentUserPic,
        updatedAt: value.updatedAt,
      };
    });

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

    if (userFeedbacks) {
      const response = {
        success: true,
        limit,
        data: newData,
        averageRating,
      };

      // Include the _id of the last document in the current page
      if (userFeedbacks.length > 0) {
        response.lastId = userFeedbacks[userFeedbacks.length - 1]._id;
      }

      return res.status(200).json(response);
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "some error occured : " + err.message });
  }
};

const getYourComment = async (req, res) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(403)
        .json({ success: false, message: "Not Authorized!" });
    }
    let { username } = req.body;
    console.log("red.body :", req.body);

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is missing!",
      });
    }
    let yourComment = await Comments.findOne({
      username,
      commentUserId: verified.username,
    });
    if (yourComment) {
      let obj = {
        username: yourComment.username,
        commentUserId: yourComment.commentUserId,
        content: yourComment.content,
        rating: yourComment.rating,
        updatedAt: yourComment.updatedAt,
      };
      return res.status(200).json({
        success: true,
        message: "your comment exists",
        yourComment: obj,
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "your comment dosent exists" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "some error occured : " + err.message });
  }
};

const addComment = async (req, res) => {
  try {
    let verified = await verifyToken(req.headers["authorization"]);
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized!" });
    }
    let { username, content, rating } = req.body;
    console.log("red.body :", req.body);

    if (!username || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: "Either username, comment or rating is missing!",
      });
    }
    let user = await Users.findOne({ username: verified.username });
    let yourComment = await Comments.findOne({
      username,
      commentUserId: verified.username,
    });
    if (yourComment) {
      await Comments.findOneAndUpdate(
        { username, commentUserId: verified.username },
        {
          content,
          rating,
          commentUserPic: user.filename
        }
      );

      return res
        .status(200)
        .json({ success: true, message: "Comment updated successfully! Please come back later to see it reflected" });
    }
    let addedComment = await Comments.create({
      username,
      content,
      rating,
      commentUserId: verified.username,
      commentUserPic: user.filename,
    });
    if (addedComment) {
      return res
        .status(200)
        .json({ success: true, message: "Comment added successfully! Please come back later to see it reflected" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "some error occured : " + err.message });
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
      .json({ success: false, message: "some error occured : " + err.message });
  }
};

module.exports = {
  fetchUserFeedbacks,
  fetchProfile,
  addComment,
  getYourComment,
};
