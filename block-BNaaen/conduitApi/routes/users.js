var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/users");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/", async (req, res) => {
  try {
    let user = await User.create(req.body);
    let token = user.signToken();
    console.log(token);
    res.status(201).json({ user: user });
  } catch (error) {
    next(error);
  }
});

// user login   using the password and the email

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "both password and email is required" });
    }
    let user = await User.findOne({ email: email });
    // if the user is not exits in the database
    if (!user) {
      return res.status(400).json({ error: "user is not registered" });
    }
    // if the user is exits then compare  the password
    let isMatched = await bcrypt.compare(password, user.password);
    // if the password is not matched
    if (!isMatched) {
      return res.status(400).json({ error: "user password is not matched" });
    }
    // if user password is mathced then generate  the user  jwt token
    // and send it to the user
    let token = user.signToken();
    res.status(202).json({ user: user });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
