const mongoose = require("mongoose");
let categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});
let Category = mongoose.model("Category", categorySchema);
module.exports = Category;
