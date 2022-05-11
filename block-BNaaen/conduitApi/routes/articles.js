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
const formatData = require("../helpers/formatdata");
let {
  userProfile,
  userJSON,
  articleformat,
  commentformat,
  formatArticles,
  formatcomments,
} = formatData;

router.use(auth.optionalAuthorization);

//feed section get only  the article which is posted by the
//users whom you are following
router.get("/feed", async (req, res, next) => {
  console.log("coming inside the feed section ");
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
    let articles = await Article.find({ author: { $in: allusers } })
      .populate("author")
      .limit(limit)
      .skip(skip);
    res.status(202).json({ articles: formatArticles(articles, req.user.id) });
  } catch (error) {
    next(error);
  }
});

// get the all articles of all the users  . Global feed
router.get("/", async (req, res, next) => {
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
      .populate("author")
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });
    res.status(202).json({ articles: formatArticles(articles, req.user.id) });
  } catch (error) {
    next(error);
  }
});

//get a single article detail
router.get("/:slug", async (req, res, next) => {
  try {
    let id = req.user.id;
    console.log(" this is the slug", req.params.slug);
    let article = await Article.findOne({ slug: req.params.slug }).populate(
      "author"
    );
    console.log("this is the article", article);
    res.status(201).json({ article: articleformat(article, id) });
  } catch (error) {
    next(error);
  }
});

// only logged in users have access to these routes
router.use(auth.isVerified);

//create a article
router.post("/", async (req, res, next) => {
  try {
    let id = req.user.id;
    req.body.author = req.user.id;
    let article = await Article.create(req.body);
    // add this created article in the user document as well
    let updateUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { myarticles: article._id },
      },
      { new: true }
    );
    article = await Article.findById(article._id).populate("author");
    res.status(201).json({ article: articleformat(article, id) });
  } catch (error) {
    next(error);
  }
});

// update article
router.put("/:slug", async (req, res, next) => {
  let id = req.user.id;
  if (req.body.taglist) {
    req.body.taglist = req.body.taglist.split(",");
  }
  if (req.body.title) {
    req.body.slug = req.body.title.split(" ").join("_");
  }
  try {
    let user = req.user.id;
    let article = await Article.findOne({ slug: req.params.slug });
    if (user == article.author) {
      let updateArticle = await Article.findByIdAndUpdate(
        article._id,
        req.body,
        {
          new: true,
        }
      ).populate("author");
      return res
        .status(202)
        .json({ article: articleformat(updateArticle, id) });
    }
    return res.status(500).json({ error: "sorry you are not authorized" });
  } catch (error) {
    next(error);
  }
});

// Delete Article
router.delete("/:slug", async (req, res, next) => {
  try {
    let user = req.user.id;
    let article = await Article.findOne({ slug: req.params.slug });
    // only the user who created this article can delete this article
    if (user == article.author) {
      let deletedArticle = await Article.findByIdAndDelete(article._id);
      return res.status(202).json({ message: "article delete sucessfully" });
    }
    res
      .status(403)
      .json({ error: "sorry you are not authorized to perform this action" });
  } catch (error) {
    next(error);
  }
});

// get a single comment
router.get("/:id/comment", async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id).populate("author");
    console.log(comment);
    res.status(202).json({ comment: commentformat(comment, req.user.id) });
  } catch (error) {
    next(error);
  }
});

// get a multiple comments of a single comments
router.get("/:slug/comments", async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    let comments = await Comment.find({ articleId: article._id }).populate(
      "author"
    );
    console.log("these are all  comments of this article", comments);
    res.status(202).json({ comments: formatcomments(comments, req.user.id) });
  } catch (error) {
    next(error);
  }
});

// add a comment in the  article
router.post("/:slug/comment", async (req, res, next) => {
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
    comment = await Comment.findById(comment._id).populate("author");
    console.log(comment);
    res.status(201).json({ comment: commentformat(comment, req.user.id) });
  } catch (error) {
    next(error);
  }
});

//update  comment  only update if the cretor of the comment wants to edit it
router.put("/:id/comment", async (req, res, next) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    if (comment.author == req.user.id) {
      let updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
        new: true,
      }).populate("author");
      res
        .status(202)
        .json({ comment: commentformat(updatedComment, req.user.id) });
    }
    res.status(400).json({ error: "you are not authorized user " });
  } catch (error) {
    next(error);
  }
});

//delete the comment
router.delete("/:id/comment", async (req, res, next) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    if (comment.author == req.user.id) {
      let deleteComment = await Comment.findByIdAndDelete(id);
      let updateArticle = await Article.findByIdAndUpdate(
        deleteComment.articleId,
        {
          $pull: { comments: comment._id },
        },
        { new: true }
      );
      res.status(202).json({ message: "Comment is deleted sucessfully" });
    }
    res.status(500).json({ error: "you are not authorized user " });
  } catch (error) {
    next(error);
  }
});

// add a favourite article  to the user data and update this in article also
// if  the user had not favourited this article then only favouite this article
router.get("/:slug/favorite", async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    if (!article.favouriteList.includes(req.user.id)) {
      let user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { favouriteArticle: article._id } },
        { new: true }
      );

      let updateArticle = await Article.findByIdAndUpdate(
        article._id,
        { $push: { favouriteList: user._id }, $inc: { favouritedCount: 1 } },
        { new: true }
      );
      res
        .status(202)
        .json({ article: articleformat(updateArticle, req.user.id) });
    }
    return res
      .status(403)
      .json({ error: "you have already favourited this article" });
  } catch (error) {
    next(error);
  }
});

//unfavourite an article remove reference form user as well as from article
// but only when if user has favourited this article
router.get("/:slug/unfavorite", async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    if (article.favouriteList.includes(req.user.id)) {
      let user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { favouriteArticle: article._id } },
        { new: true }
      );

      let updateArticle = await Article.findByIdAndUpdate(
        article._id,
        { $pull: { favouriteList: user._id }, $inc: { favouritedCount: -1 } },
        { new: true }
      );
      res
        .status(202)
        .json({ article: articleformat(updateArticle, req.user.id) });
    }
    res
      .status(403)
      .json({ error: "you have not favourited this article yet.." });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
