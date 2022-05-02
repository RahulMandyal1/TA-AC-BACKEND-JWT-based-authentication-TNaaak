const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const app = express();
//establish  the connection with  the database
// establishing a connection between the server and the user
mongoose.connect("mongodb://127.0.0.1:27017/makeapi", (err) => {
  console.log(err ? err : "Connection is made sucessfully");
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);

module.exports = app;
