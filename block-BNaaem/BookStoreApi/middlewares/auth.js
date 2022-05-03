let jwt = require("jsonwebtoken");
module.exports = {
  verifyUser: async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (token) {
        jwt.verify(token, "thisisthesecret", function (err, decode) {
          req.user = decode;
          return next();
        });
      }
      res.json({ error: "token is not available" });
    } catch (e) {
      res.json({ error: "token not matched" });
    }
  },
};
