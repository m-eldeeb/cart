const express = require("express");
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const pages = require("./routes/pages");
const users = require("./routes/users");
const cart = require("./routes/cart");
const products = require("./routes/products");
const adminPages = require("./routes/admin_pages");
const adminCategories = require("./routes/admin_categories");
const adminProducts = require("./routes/admin_products");
const fileUpload = require("express-fileupload");

const passport = require("passport");

const PORT = process.env.PORT || 3000;
// init app
const app = express();

// Express fileUpload middleware
app.use(fileUpload({ createParentPath: true }));

// view engine setup
app.set("view engine", "ejs");

// set public folder
app.use(express.static(path.join(__dirname, "/public")));

// set global errors variable
app.locals.errors = null;

// Get Page Model
let Page = require("./models/page");

// Get all pages to pass to header.ejs
Page.find({}, function (err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// Get Page Model
let Category = require("./models/category");

// Get all pages to pass to header.ejs
Category.find({}, function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

//parses incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 3000;

// express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 6000, secure: true },
  })
);

// set flash message
app.use(flash());
app.use((req, res, next) => {
  res.locals.message = req.flash();

  next();
});

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;

  next();
});

//  set routes
app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/users", users);
app.use("/cart", cart);
app.use("/", pages);

// app.get("/", (req, res) => {
//   req.flash("success",'welcome to home page');
//   // res.render("flash", { message: req.flash("message") });
//   // res.render("index", { title: "Home" });
//   res.redirect("/flash");
// });

// app.get("/flash", (req, res) => {
//   // res.send(req.flash("success"));
//   res.render("flash");
// });

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log("server listening on port " + PORT + "........");
});
