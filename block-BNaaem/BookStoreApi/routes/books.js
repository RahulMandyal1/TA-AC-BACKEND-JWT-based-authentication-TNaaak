const Book = require("../models/books");
const express = require("express");
const router = express.Router();
const category = require("../models/category");
const Category = require("../models/category");
const auth = require("../middlewares/auth");
const Cart = require("../models/usercart");
const User = require("../models/users");
const { create } = require("../models/users");
const Comment = require("../models/comment");
//list all the books
router.get("/", async (req, res) => {
  try {
    let books = await Book.find({}).populate("category");
    res.status(202).json(books);
  } catch (err) {
    res.status(500).json(err);
  }
});

// to Create a book
router.post("/", async (req, res) => {
  try {
    let categoryname = req.body.category;
    req.body.category = [];
    let tagsArr = req.body.tags.split(",");
    req.body.tags = tagsArr;
    let book = await Book.create(req.body);
    // creates a category  document alng with the book id as well
    let category = await Category.create({
      name: categoryname,
      bookId: book._id,
    });
    // now update  the book as well add  the category in the book as well
    let updateBook = await Book.findByIdAndUpdate(
      book._id,
      {
        $push: { category: category._id },
      },
      { new: true }
    );
    res.status(202).json({ updateBook });
  } catch (err) {
    res.status(500).json(err);
  }

  //delete a book
  router.get("/delete/:id", async (req, res) => {
    try {
      let id = req.params.id;
      let book = await Book.findByIdAndDelete(id);
      res.status(202).json(book);
    } catch (err) {
      res.status(500).json(err);
    }
  });
});

//update a book put request can be done only from the postman
router.put("/:id", async (req, res) => {
  try {
    let categoryname = req.body.category;
    req.body.category = [];
    let id = req.params.id;
    let book = await Book.findByIdAndUpdate(id, req.body, { new: true });
    let updateCategory = await Category.findOneAndUpdate(
      { bookId: book._id },
      { name: categoryname },
      { new: true }
    );
    // now update  the book as well add  the category in the book as well
    let updateBook = await Book.findByIdAndUpdate(
      book._id,
      {
        $push: { category: updateCategory._id },
      },
      { new: true }
    );
    res.status(202).json(updateBook);
  } catch (err) {
    res.status(500).json(err);
  }
});

// if the user wants to delete the category by its name only then

router.get("/delete/:categoryname/category", async (req, res) => {
  try {
    let categoryname = req.params.categoryname;
    let category = await Category.deleteMany(
      { name: categoryname },
      { new: true }
    );
    res.status(202).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //get all the book from only the categories
router.get("/:categoryname/category", async (req, res) => {
  try {
    let categoryname = req.params.categoryname;
    let categoryData = await Category.find({ name: categoryname }).populate(
      "bookId"
    );
    return res.status(202).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // - list all tags

router.get("/alltags", async (req, res) => {
  try {
    let books = await Book.find({}).populate("category");
    let tagarr = [];
    let tagsArray = books.forEach((cv) => {
      cv.tags.forEach((cv) => {
        tagarr.push(cv);
      });
    });
    let uniqueArr = [...new Set(tagarr)];
    res.status(200).json(uniqueArr);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // get all tags in  the ascending order
router.get("/alltags/ascending", async (req, res) => {
  try {
    let books = await Book.find({}).populate("category");
    let tagarr = [];
    let tagsArray = books.forEach((cv) => {
      cv.tags.forEach((cv) => {
        tagarr.push(cv);
      });
    });
    let uniqueArr = [...new Set(tagarr)];
    let ascendingorder = tagarr.sort();
    res.status(200).json(ascendingorder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//user cart  : it will return all those book which that user has added
// in his cart
router.get("/:id/addtocart", async (req, res) => {
  try {
    req.userid = "6270bbe196cd34766c482eb4";
    let id = req.params.id;
    let createCart = await Cart.create({ user: req.userid, bookId: id });
    let allBooksinCart = await Cart.find({ user: req.userid }).populate(
      "bookId"
    );
    res.status(200).json(allBooksinCart);
  } catch (e) {
    console.log(req.userid);
    res.json({ error: " an error occured in the  the user cart" });
  }
});
// remove  an book from the user cart
router.get("/:id/deletecart", async (req, res) => {
  try {
    let id = req.params.id;
    let createCart = await Cart.findByIdAndDelete(id);
    let allBooksinCart = await Cart.find({ user: req.userid }).populate(
      "bookId"
    );
    res.status(200).json(allBooksinCart);
  } catch (e) {
    console.log(req.userid);
    res.json({ error: " an error occured in the  delete user cart" });
  }
});
// create a comment in  the bookstore app
router.post("/:bookId/comment", async (req, res) => {
  try {
    req.body.userId = req.userid;
    req.body.bookId = req.params.bookId;
    let comment = await Comment.create(req.body);
    let updateBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      { $push: { comments: comment._id } },
      { new: true }
    );
    res.status(201).json({ message: "comment created sucessfully" });
  } catch (e) {
    return res.json({ error: "comment is not created sucessfully" });
  }
});
module.exports = router;