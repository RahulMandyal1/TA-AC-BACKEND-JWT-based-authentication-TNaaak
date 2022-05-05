const express = require("express");
let router = express.Router();
let Article = require("../models/articles");
let auth = require("../middlewares/auth");
const User = require("../models/users");
let Comment = require("../models/comment");

// get the list of all the tags
router.get("/", async (req, res) => {
  try {
    let articles = await Article.find({});
    // get all the tags
    let alltags = articles.reduce((acc, eacharticle) => {
      eacharticle.taglist.forEach((tagname) => {
        acc.push(tagname);
      });
      return acc;
    }, []);
    // get uniquetags from all the tags
    let uniquetags = [...new Set(alltags)];
    res.status(200).json({ tags: uniquetags });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
module.exports = router;
