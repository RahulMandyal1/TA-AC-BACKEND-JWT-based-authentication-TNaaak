let mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

// Before registring the user hash the password
userSchema.pre("save", async function (req, res, next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (e) {
    res.status(500).json(e);
  }
});
// get the json web token  here
userSchema.methods.signToken = async function () {
  try {
    let token = jwt.sign(
      { user: this.id, email: this.email },
      "thisisthesecret"
    );
    return token;
  } catch (e) {
    return "there is an error while generating  the token and the error is", e;
  }
};

userSchema.methods.UserJson = function (token) {
  return {
    userId: this.userId,
    email: this.email,
    token: token,
  };
};
let User = mongoose.model("User", userSchema);
module.exports = User;
