const mongoose = require("mongoose");


const CommentSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true },
      commentUserId: { type: String, required: true, unique: true },
      content: { type: String, required: true },
      rating: {type: Number, required: true}
    },
    { timestamps: true }
  );

  CommentSchema.index({ username: 1 });


const Comments = mongoose.model("comments", CommentSchema);

module.exports = Comments;