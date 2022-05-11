const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const commentSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
  },
  { timestamps: true }
);
let Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;