const express = require("express");
const router = express.Router();
const User = require("../models/users");
const auth = require("../middlewares/auth");
const formatData = require("../helpers/formatdata");
let { userProfile, userJSON, articleformat } = formatData;
//only verified users have access to these routes
router.use(auth.isVerified);

// get the current logged in user information
router.get("/", async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.user.email });
    res.status(202).json({ user: userJSON(user, req.headers.authorization) });
  } catch (e) {
    res.status(500).json({ error: " user in not found " });
  }
});

// update current logged in user information
router.put("/", async (req, res, next) => {
  try {
    let user = await User.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      { new: true }
    );
    res.status(202).json({ user: userJSON(user, req.headers.authorization) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
