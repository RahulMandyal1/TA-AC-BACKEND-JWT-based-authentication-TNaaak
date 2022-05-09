const express = require("express");
let router = express.Router();
let Article = require("../models/articles");
let auth = require("../middlewares/auth");
const User = require("../models/users");
let Comment = require("../models/comment");

// get the list of all the tags
router.get("/", auth.optionalAuthorization, async (req, res) => {
  try {
    let alltags = await Article.find({}).distinct("taglist");
    res.status(200).json({ tags: alltags });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
module.exports = router;
