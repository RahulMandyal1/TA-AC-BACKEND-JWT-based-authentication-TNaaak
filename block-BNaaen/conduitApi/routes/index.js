var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Article = require("../models/articles");
/* GET home page. */
router.get("/", auth.isVerified, function (req, res, next) {
  res.json({ message: " welcome to my conduit api" });
});
module.exports = router;
