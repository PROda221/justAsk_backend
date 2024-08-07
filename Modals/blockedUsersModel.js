
const mongoose = require("mongoose");

const BlockedRelationshipSchema = new mongoose.Schema(
    {
      blocker: { type: String, required: true }, // Username of the user who blocks
      blocked: { type: String, required: true }, // Username of the user who is blocked
      blockedImg: { type: String }
    },
    { timestamps: true }
  );

  BlockedRelationshipSchema.index({ blocker: 1 });
  
  const BlockedUsers = mongoose.model('BlockedUsers', BlockedRelationshipSchema);

  module.exports = BlockedUsers;