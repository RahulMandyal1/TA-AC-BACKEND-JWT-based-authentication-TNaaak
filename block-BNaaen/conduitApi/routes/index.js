var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Article = require("../models/articles");
/* GET home page. */
router.get("/", auth.isVerified, function (req, res, next) {
  res.status(202).json({ message: " this is the home page " });
});

// get the current logged in user information
router.get("/user", auth.isVerified, async (req, res, next) => {
  try {
    console.log("this is the current logged in user information", req.user);
    let user = await User.findOne({ email: req.user.email });
    res.status(202).json({ user: user });
  } catch (e) {
    res.status(500).json({ error: " user in not found " });
  }
});

// update current logged in user information
router.put("/user", auth.isVerified, async (req, res, next) => {
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

// get any user profile information requested by any user
router.get("/profiles/:username", async function (req, res, next) {
  try {
    let username = req.params.username;
    let user = await User.findOne({ username: username });
    res.status(200).json({ user: user });
  } catch (e) {
    res.status(500).json({ error: " can not find  the user profile" });
  }
});

//follow  the user
router.get(
  "/profiles/:username/follow",
  auth.isVerified,
  async (req, res, next) => {
    try {
      let username = req.params.username;
      let user = await User.findOne({ username: username });
      let updateProfile = await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: { followingList: user._id },
        },
        {
          new: true,
        }
      );
      res.status(202).json({ user: updateProfile });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
);

//unfollow the user

router.get(
  "/profiles/:username/unfollow",
  auth.isVerified,
  async (req, res, next) => {
    try {
      let username = req.params.username;
      let user = await User.findOne({ username: username });
      let updateProfile = await User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: { followingList: user._id },
        },
        {
          new: true,
        }
      );
      res.status(202).json({ user: updateProfile });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
);
module.exports = router;
