const express = require("express");
const router = express.Router();
const validator = require("../util/pageValidation");
const Page = require("../models/page");
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;

router.get("/", isAdmin, (req, res) => {
  Page.find({}, (err, pages) => {
    res.render("admin/pages", {
      pages: pages,
    });
  });
});

// get add page
router.get("/add-page", isAdmin, (req, res) => {
  const title = "";
  const slug = "";
  const content = "";
  res.render("admin/add_page", { title: title, slug: slug, content: content });
});

// post add page
router.post("/add-page", (req, res) => {
  const valid = validator(req.body);
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/, "-").toLowerCase();

  let content = req.body.content;

  if (!valid) {
    res.render("admin/add_page", {
      errors: validator.errors,
      title: title,
      slug: slug,
      content: content,
    });
  } else {
    Page.findOne({ slug: slug }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exists, choose another.");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content,
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
        });

        page.save((err) => {
          if (err) return console.log(err);

          Page.find({}, (err, pages) => {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.pages = pages;
            }
          });

          req.flash("success", "Page added!");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

/*
 * GET edit page
 */
router.get("/edit-page/:id", isAdmin, (req, res) => {
  Page.findById(req.params.id, (err, page) => {
    if (err) return console.log(err);

    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id,
    });
  });
});

/*
 * POST edit page
 */

router.post("/edit-page/:id", (req, res) => {
  console.log(req.body);
  const valid = validator(req.body);
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/, "-").toLowerCase();

  let content = req.body.content;
  let id = req.params.id;

  if (!valid) {
    console.log(validator.errors);
    res.render("admin/edit_page", {
      errors: validator.errors,
      title: title,
      slug: slug,
      content: content,
      id: id,
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exists, choose another.");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content,
          id: id,
        });
      } else {
        Page.findById(id, function (err, page) {
          if (err) return console.log(err);

          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save((err) => {
            if (err) return console.log(err);

            Page.find({}, (err, pages) => {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.pages = pages;
              }
            });

            req.flash("success", "Page edited!");
            res.redirect("/admin/pages/edit-page/" + id);
          });
        });
      }
    });
  }
});

/*
 * GET delete page
 */
router.get("/delete-page/:id", isAdmin, function (req, res) {
  Page.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);

    Page.find({}, (err, pages) => {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.pages = pages;
      }
    });

    req.flash("success", "Page deleted!");
    res.redirect("/admin/pages/");
  });
});

module.exports = router;
