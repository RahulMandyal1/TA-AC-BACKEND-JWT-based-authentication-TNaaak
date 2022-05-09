const express = require("express");
let router = express.Router();
let Article = require("../models/articles");
let auth = require("../middlewares/auth");
const User = require("../models/users");
let Comment = require("../models/comment");
const { findOne } = require("../models/users");
const { route } = require(".");
const { compareSync } = require("bcrypt");
const { all } = require("express/lib/application");

//feed section get only  the article which is posted by the
//users whom you are following
router.get("/feed", auth.optionalAuthorization, async (req, res) => {
  let limit = 10;
  let skip = 0;
  if (req.query.limit) {
    limit = req.params.limit;
  }
  if (req.query.offset) {
    skip = req.query.offset;
  }
  try {
    // Get all the followed user id
    let allusers = await User.findById(req.user.id).distinct("followingList");
    //Get followed user posted articles
    let allarticles = allusers.map(async (cv) => {
      let articles = await Article.find({ author: cv })
        .populate("author")
        .limit(limit)
        .skip(skip)
        .sort({ _id: -1 });
      return articles;
    });
    //resolved those articles
    let resolvedArticles = await Promise.all(allarticles);
    res.status(202).json({ articles: resolvedArticles });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// get the all articles of all the users
router.get("/", auth.optionalAuthorization, async (req, res) => {
  let limit = 10;
  let skip = 0;
  let { tag, author, favourite } = req.query;
  // in query form the database we will pass the filter Object
  const filter = {};
  if (tag) {
    filter.taglist = { $in: req.query.tag };
  }
  if (author) {
    let user = await User.findOne({ username: req.query.author });
    filter.author = user._id;
  }
  if (limit) {
    limit = req.query.limit;
  }
  if (skip) {
    skip = req.query.skip;
  }
  try {
    let articles = await Article.find(filter)
      .populate({
        path: "author",
        select: ["username", "avatar"],
      })
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });
    res.status(202).json({ articles: articles });
  } catch (err) {
    res.status(500).json({ err: "error genereated" });
  }
});

// only logged in users have access to these routes
router.use(auth.isVerified);

//create a article
router.post("/", async (req, res) => {
  req.body.taglist = req.body.taglist.split(",");
  try {
    req.body.author = req.user.id;
    console.log("this is the id of  user author", req.user);
    console.log("this is the body data two", req.body);
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
router.put("/:slug", async (req, res) => {
  //if the user update tags then once again convert str to array
  if (req.body.taglist) {
    req.body.taglist = req.body.taglist.split(",");
  }
  //   if user change its  title then also chage its slug
  if (req.body.title) {
    req.body.slug = req.body.title.split(" ").join("_");
  }
  try {
    let user = req.user.id;
    let article = await Article.findOne({ slug: req.params.slug });
    if (user == article.author) {
      let updateArticle = await Article.findByIdAndUpdate(article._id, req.body, {
        new: true,
      });
      return res.status(202).json({ article: updateArticle });
    }
    return res.status(500).json({ error: "sorry you are not authorized" });
  } catch (err) {
    res.status(500).json({ err: "article not updated " });
  }
});

// Delete Article
router.delete("/:slug", async (req, res) => {
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
router.post("/:slug/comment", async (req, res) => {
  try {
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
    res.status(201).json({ comment: comment });
  } catch (err) {
    res.status(500).json({ error: "comment is not created " });
  }
});

//update  comment  only update if the cretor of the comment wants to edit it
router.put("/:id/comment", async (req, res) => {
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
router.delete("/:id/comment", async (req, res) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    if (comment.author == req.user.id) {
      let deleteComment = await Comment.findByIdAndDelete(id);
      res.status(202).json({ comment: deleteComment });
    }
    res.status(500).json({ error: "you are not authorized user " });
  } catch (err) {
    res.status(500).json({ error: "comment is not deleted" });
  }
});

// add a favourite article  to the user data
router.get("/:slug/favorite", async (req, res) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { favouriteArticle: article._id } },
      { new: true }
    );
    res.status(202).json({ article: article });
  } catch (err) {
    res.status(500).json({ error: "article is not added" });
  }
});

//unfavourite an article
router.get("/:slug/unfavorite", async (req, res) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favouriteArticle: article._id } },
      { new: true }
    );
    res.status(202).json({ article: article });
  } catch (err) {
    res.status(500).json({ error: "article is  not removed" });
  }
});
module.exports = router;
