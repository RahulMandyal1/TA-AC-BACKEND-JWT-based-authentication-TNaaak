let mongoose = require("mongoose");
let cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
});

let UserCart = mongoose.model("UserCart", cartSchema);
module.exports = UserCart;
