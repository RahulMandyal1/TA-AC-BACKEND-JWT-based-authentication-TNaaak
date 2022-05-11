const mongoose = require("mongoose");
//establish our application connection with the database
module.exports.connect = function () {
  mongoose.connect("mongodb://127.0.0.1:27017/conduitApi", (err) => {
    console.log(err ? err : "Connection is made sucessfully");
  });
};
