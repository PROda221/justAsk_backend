
const mongoose = require("mongoose");

const BlockedRelationshipSchema = new mongoose.Schema(
    {
      blocker: { type: String, required: true }, // Username of the user who blocks
      blocked: { type: String, required: true }, // Username of the user who is blocked
    },
    { timestamps: true }
  );

  BlockedRelationshipSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
  
  const BlockedUsers = mongoose.model('BlockedUsers', BlockedRelationshipSchema);

  module.exports = BlockedUsers;