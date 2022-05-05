const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Article = require("../models/articles");

// get any user profile information requested by any user
router.get("/:username", async function (req, res, next) {
  try {
    let username = req.params.username;
    let user = await User.findOne({ username: username });
    res.status(200).json({ user: user });
  } catch (e) {
    res.status(500).json({ error: " can not find  the user profile" });
  }
});

//follow  the user
router.get("/:username/follow", auth.isVerified, async (req, res, next) => {
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

    // now update again if one user has followed then it should be
    //reflected back in other user data so update the second user follower list
    let updateFollowerList = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { followersList: updateProfile._id },
      },
      { new: true }
    );
    console.log(
      " this is the udpated profile of following user",
      updateFollowerList
    );
    res.status(202).json({ user: updateProfile });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//unfollow the user

router.get("/:username/unfollow", auth.isVerified, async (req, res, next) => {
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
});
module.exports = router;
