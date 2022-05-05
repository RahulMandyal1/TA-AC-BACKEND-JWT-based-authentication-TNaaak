const express = require("express");
const router = express.Router();
const User = require("../models/users");
const auth = require("../middlewares/auth");

// get the current logged in user information
router.get("/", auth.isVerified, async (req, res, next) => {
  try {
    console.log("this is the current logged in user information", req.user);
    let user = await User.findOne({ email: req.user.email });
    res.status(202).json({ user: user });
  } catch (e) {
    res.status(500).json({ error: " user in not found " });
  }
});

// update current logged in user information
router.put("/", auth.isVerified, async (req, res, next) => {
  try {
    let user = await User.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      { new: true }
    );
    res.status(202).json({ user: user });
  } catch (e) {
    res.status(500).json({ error: " user is not updated " });
  }
});

module.exports = router;
