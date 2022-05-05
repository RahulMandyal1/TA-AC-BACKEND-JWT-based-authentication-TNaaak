var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Article = require("../models/articles");
/* GET home page. */
router.get("/", auth.isVerified, function (req, res, next) {
  res.status(202).json({ message: " this is the home page " });
});
module.exports = router;
