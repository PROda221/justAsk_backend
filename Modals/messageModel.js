const mongoose = require("mongoose");

const messageShema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  recepientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: String,
  imageUrl: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

const Message = mongoose.model("Message", messageShema);

module.exports = Message;
