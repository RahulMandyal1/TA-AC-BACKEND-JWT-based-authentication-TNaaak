const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
//database connection
require("../conduitApi/config/database").connect();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const articleRouter = require("./routes/articles");
const tagsRouter = require("./routes/tags");
let userRouter = require("./routes/user");
const profileRouter = require("./routes/profiles");
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/", indexRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tags", tagsRouter);
app.use("/api/v1/profiles", profileRouter);
module.exports = app;
