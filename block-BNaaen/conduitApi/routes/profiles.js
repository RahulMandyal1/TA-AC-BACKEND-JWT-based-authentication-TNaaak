const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Article = require("../models/articles");

// get any user profile by his username
router.get(
  "/:username",
  auth.optionalAuthorization,
  async function (req, res, next) {
    try {
      let username = req.params.username;
      let user = await User.findOne({ username: username }).select({
        password: 0,
      });
      res.status(200).json({ user: user });
    } catch (error) {
      next(error);
    }
  }
);

// only verified user have access to these routes
router.use(auth.isVerified);

//follow  the user
router.get("/:username/follow", async (req, res, next) => {
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
    //update the targated user data
    let targatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { followersList: updateProfile._id },
      },
      { new: true }
    );
    res.status(202).json({ user: updateProfile, targatedUser: targatedUser });
  } catch (error) {
    next(error);
  }
});

//unfollow the user
router.get("/:username/unfollow", async (req, res, next) => {
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
    //update targated user data
    let targatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { followersList: updateProfile._id },
      },
      { new: true }
    );
    res.status(202).json({ user: updateProfile, targatedUser: targatedUser });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
