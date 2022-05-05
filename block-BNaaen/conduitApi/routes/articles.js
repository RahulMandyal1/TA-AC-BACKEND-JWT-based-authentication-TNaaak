const express = require("express");
let router = express.Router();
let Article = require("../models/articles");
let auth = require("../middlewares/auth");
const User = require("../models/users");
let Comment = require("../models/comment");
const { findOne } = require("../models/users");
//create a article
router.post("/", auth.isVerified, async (req, res) => {
  try {
    req.body.author = req.user.id;
    req.body.taglist = req.body.taglist.split(" ");
    let article = await Article.create(req.body);
    // add this created article in the user document as well
    let updateUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { myarticles: article._id },
      },
      { new: true }
    );

    res.status(201).json({ article: article });
  } catch (err) {
    res.status(500).json({ err: "article not created " });
  }
});
// update article
router.put("/:slug", auth.isVerified, async (req, res) => {
  try {
    let user = req.user.id;
    req.body.taglist = req.body.taglist.split(" ");
    let article = await Article.findOne({ slug: req.params.slug });
    if (user == article.author) {
      let updateArticle = await Article.findById(article._id, req.body, {
        new: true,
      });
      return res.status(202).json({ article: updateArticle });
    }
    res.status(500).json({ error: "sorry you are not authorized" });
  } catch (err) {
    res.status(500).json({ err: "article not created " });
  }
});

// Delete Article
router.delete("/:slug", auth.isVerified, async (req, res) => {
  try {
    let user = req.user.id;
    let article = await Article.findOne({ slug: req.params.slug });
    // only the user who created this article can delete this article
    if (user == article.author) {
      let deletedArticle = await Article.findByIdAndDelete(article._id);
      return res.status(202).json({ article: deletedArticle });
    }
    res.status(500).json({ error: "sorry you are not authorized" });
  } catch (err) {
    res.status(500).json({ error: "article not created " });
  }
});

// add a comment in the  article
router.post("/:slug/comment", auth.isVerified, async (req, res) => {
  try {
    console.log(req.body);
    let article = await Article.findOne({ slug: req.params.slug });
    req.body.author = req.user.id;
    req.body.articleId = article._id;
    // now update  the commnets in the article document
    let comment = await Comment.create(req.body);
    let updateArticle = await Article.findByIdAndUpdate(
      article._id,
      {
        $push: { comments: comment._id },
      },
      { new: true }
    );
    console.log("this is the article ", updateArticle);
    res.status(201).json({ comment: comment });
  } catch (err) {
    res.status(500).json({ error: "comment is not created " });
  }
});

//update  comment  only update if the cretor of the comment wants to edit it
router.put("/:id/comment", auth.isVerified, async (req, res) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    if (comment.author == req.user.id) {
      let updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(202).json({ comment: updatedComment });
    }
    res.status(500).json({ error: "you are not authorized user " });
  } catch (err) {
    res.status(500).json({ error: "comment is not created" });
  }
});

//delete the comment
router.delete("/:id/comment", auth.isVerified, async (req, res) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    console.log("this is the comment", comment);
    if (comment.author == req.user.id) {
      let deleteComment = await Comment.findByIdAndDelete(id, { new: true });
      res.status(202).json({ comment: deleteComment });
    }
    res.status(500).json({ error: "you are not authorized user " });
  } catch (err) {
    res.status(500).json({ error: "comment is not deleted" });
  }
});
module.exports = router;
