const express = require("express");
const router = express.Router();
const validator = require("../util/categoryValidation");
const Category = require("../models/category");
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;
/*
 * GET category index
 */

router.get("/", isAdmin,function (req, res) {
  Category.find(function (err, categories) {
    if (err) return console.log(err);
    res.render("admin/categories", {
      categories: categories,
    });
  });
});

// get add category
router.get("/add-category", isAdmin,function (req, res) {
  var title = "";

  res.render("admin/add_category", {
    title: title,
  });
});

// post add category
router.post("/add-category", (req, res) => {
  const valid = validator(req.body);
  let title = req.body.title;
  let slug = title.replace(/\s+/, "-").toLowerCase();

  if (!valid) {
    res.render("admin/add_page", {
      errors: validator.errors,
      title: title,
    });
  } else {
    Category.findOne({ slug: slug }, (err, category) => {
      if (category) {
        req.flash("danger", "category title exists, choose another.");
        res.render("admin/add_category", {
          title: title,
        });
      } else {
        const category = new Category({
          title: title,
          slug: slug,
        });

        category.save((err) => {
          if (err) return console.log(err);

          Category.find({}, function (err, categories) {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.categories = categories;
            }
          });
          req.flash("success", "category added!");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

/*
 * GET edit category
 */
router.get("/edit-category/:id",isAdmin, (req, res) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) return console.log(err);

    res.render("admin/edit_category", {
      title: category.title,
      id: category._id,
    });
  });
});

/*
 * POST edit category
 */

router.post("/edit-category/:id", (req, res) => {
  const valid = validator(req.body);
  let title = req.body.title;
  let slug = title.replace(/\s+/, "-").toLowerCase();

  let id = req.params.id;

  if (!valid) {
    console.log(validator.errors);
    res.render("admin/edit_page", {
      errors: validator.errors,
      title: title,
      id: id,
    });
  } else {
    Category.findOne({ slug: slug, _id: { $ne: id } }, (err, category) => {
      if (category) {
        req.flash("danger", "category slug exists, choose another.");
        res.render("admin/edit_category", {
          title: title,
          id: id,
        });
      } else {
        Category.findById(id, function (err, category) {
          if (err) return console.log(err);

          category.title = title;
          category.slug = slug;

          category.save((err) => {
            if (err) return console.log(err);
            Category.find({}, function (err, categories) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.categories = categories;
              }
            });
            req.flash("success", "Category edited!");
            res.redirect("/admin/categories/edit-category/" + id);
          });
        });
      }
    });
  }
});

/*
 * GET delete page
 */
router.get("/delete-category/:id",isAdmin, function (req, res) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);
    Category.find({}, function (err, categories) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.categories = categories;
      }
    });

    req.flash("success", "category deleted!");
    res.redirect("/admin/categories");
  });
});

module.exports = router;
