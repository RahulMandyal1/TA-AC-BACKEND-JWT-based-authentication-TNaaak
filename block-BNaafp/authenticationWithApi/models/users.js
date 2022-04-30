const bcrypt = require("bcrypt");
let mongoose = require("mongoose");
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
});

// Before registring the user or before saving  the user hash
// the password

userSchema.pre("save", async (req, res, next) => {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    console.log(" this is the user password right now", this.password);
    next();
  } catch (e) {
    res.status(500).json(e);
  }
});
let User = mongoose.model("User", userSchema);
module.exports = User;
