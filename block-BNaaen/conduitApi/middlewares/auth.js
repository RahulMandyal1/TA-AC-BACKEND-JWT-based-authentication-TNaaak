const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

//to verify if the user is logged in only if the token is mathced
// so we will get some information about  the user that we have entered
// in the payload when we have send the token to user for  the first time
module.exports = {
  isVerified: async function (req, res, next) {
    let token = req.headers.authorization;
    try {
      let payload= jwt.verify(token, process.env.SECRET);
      req.user = payload;
      return next();
    } catch (err) {
      return res
        .status(500)
        .json({ error: "token is not valid you need to login again" });
    }
  },
  optionalAuthorization: async (req, res, next) => {
    let token = req.headers.authorization;
    try {
      if (!token) {
        req.user = {
          id: null,
          email: null,
        };
        return next();
      }
      let payload = jwt.verify(token, process.env.SECRET);
      req.user = payload;
      return next();
    } catch (error) {
      next(error);
    }
  },
};