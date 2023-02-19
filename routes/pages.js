const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
// Get Page model
const Page = require("../models/page");

/*
 * GET /
 */
router.get("/", function (req, res) {
  Page.findOne({ slug: "home" }, function (err, page) {
    if (err) console.log(err);

    res.render("index", {
      title: page.title,
      content: page.content,
    });
  //   var galleryDir = "public/images/slide_images/";

  //   fs.readdir(galleryDir, function (err, files) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       images = files;
  //       console.log(images);
      
  //     }
  //   });
  // });
});
})
/*
 * GET a page
 */
router.get("/:slug", function (req, res) {
  let slug = req.params.slug;

  Page.findOne({ slug: slug }, function (err, page) {
    if (err) console.log(err);

    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    }
  });
});

module.exports = router;
