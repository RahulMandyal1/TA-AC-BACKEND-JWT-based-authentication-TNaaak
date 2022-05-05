const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let articleSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String, required: true },
  body: { type: String, required: true },
  taglist: [{ type: String }],
  likes: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Commment" }],
});

// to assign  slug to article document
articleSchema.pre("save", function (next) {
  this.slug = this.title + randomNumber();
  this.slug = this.slug.split(" ").join("-");
  next();
});

function randomNumber(num = 123223) {
  return Math.floor(Math.random() * num);
}
let Article = mongoose.model("Article", articleSchema);
module.exports = Article;
