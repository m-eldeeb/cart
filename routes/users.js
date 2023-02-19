const express = require("express");
const router = express.Router();

const passport = require("passport");
const bcrypt = require("bcrypt");
const validator = require("../util/userValidator");

// Get Users model
const User = require("../models/user");

/*
 * GET /
 */
router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register",
  });
});

/*
 * POST register
 */
router.post("/register", function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  const valid = validator(req.body);

  if (!valid) {
    // if (password !== password2)
    //   validator.errors = {
    //     instancePath: "/passwords didn't match",
    //     message: "",
    //   };
    console.log(validator.errors);
    res.render("register", {
      errors: validator.errors,
      user: null,
      title: "Register",
    });
  } else {
    User.findOne({ username: username }, function (err, user) {
      if (err) console.log(err);

      if (user) {
        req.flash("danger", "Username exists, choose another!");
        res.redirect("/users/register");
      } else {
        var user = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 0,
        });

        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) console.log(err);

            user.password = hash;

            user.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                req.flash("success", "You are now registered!");
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

/*
 * GET login
 */
router.get("/login", function (req, res) {
  if (res.locals.user) res.redirect("/");

  res.render("login", {
    title: "Log in",
  });
});

/*
 * POST login
 */

router.post("/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

/*
 * GET logout
 */
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/users/login");
  });
});
module.exports = router;
