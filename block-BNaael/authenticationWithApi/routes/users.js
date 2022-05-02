const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const { token } = require("morgan");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// register a user first
router.post("/register", async (req, res) => {
  try {
    console.log(" this is the register data", req.body);
    let user = await User.create(req.body);
    let token = await user.signToken();
    res.redirect("/");
  } catch (e) {
    res.status(500).json(e);
  }
});
// login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Both email and password are required" });
  }
  try {
    let user = await User.findOne({ email: email });
    //  if the email is not exits in our database
    if (!user) {
      return res.status(400).json({ error: " this email  not registered" });
    }
    let isMatched = await bcrypt.compare(req.body.password, user.password);
    // if the password is not matched
    if (!isMatched) {
      return res.status(400).json({ error: "Password is not matched " });
    }
    //if the user is found and the password is also  matched then we are
    // going to generate  the token JWT token || for right now i have just
    // retured the logged in user only

    let token = await user.signToken();
    return res.send(token);
    // return res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
