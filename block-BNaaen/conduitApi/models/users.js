const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const auth = require("../middlewares/auth");
require("dotenv").config();
let userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    followingList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followersList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    myarticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    favouriteArticle: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  { timestamps: true }
);

// hash  the user password before saving user data sinto the database
userSchema.pre("save", async function (req, res, next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (e) {
    res.status(500).json(e);
  }
});

//sign the user web token here to authenticate  the user
userSchema.methods.signToken = function () {
  let payload = {
    id: this.id,
    name: this.name,
    email: this.email,
  };
  try {
    let token = jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (e) {
    res
      .status(500)
      .json({ error: " an error occured while signing the token " });
  }
};
let User = mongoose.model("User", userSchema);
module.exports = User;
