const mongoose = require("mongoose");
let commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
