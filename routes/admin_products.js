const express = require("express");
const router = express.Router();
const validator = require("../util/productValidation");
const Category = require("../models/category");
const Product = require("../models/product");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");
const resizeImg = require("resize-img");
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;

// const path = require('path')
/*
 * GET product index
 */

router.get("/", isAdmin, function (req, res) {
  let count;

  Product.count(function (err, c) {
    count = c;
  });

  Product.find(function (err, products) {
    setTimeout(() => {
      res.render("admin/products", {
        products: products,
        count: count,
      });
    }, 3000);
  });
});

// get add product
router.get("/add-product", isAdmin, function (req, res) {
  const title = "";
  const desc = "";
  const price = "";

  Category.find((err, categories) => {
    res.render("admin/add_product", {
      title: title,
      desc: desc,
      categories: categories,
      price: price,
    });
  });
});

// post add product
router.post("/add-product", (req, res) => {
  let imageFile = "";
  if (req.files && typeof req.files.image !== "undefined") {
    imageFile = req.files.image.name;
  }

  const valid = validator(req.body);

  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let desc = req.body.desc;
  let price = req.body.price;
  let category = req.body.category;

  if (!valid) {
    Category.find(function (err, categories) {
      res.render("admin/add_product", {
        errors: validator.errors,
        title: title,
        desc: desc,
        categories: categories,
        price: price,
      });
    });
  } else {
    Product.findOne({ slug: slug }, (err, product) => {
      if (product) {
        req.flash("danger", "category title exists, choose another.");
        res.render("admin/add_product", {
          title: title,
          desc: desc,
          categories: categories,
          price: price,
        });
      } else {
        const price2 = parseFloat(price).toFixed(2);
        const product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile,
        });

        product.save((err) => {
          if (err) return console.log(err);

          mkdirp("public/product_images/" + product._id)
            .catch((err) => {
              console.log(err);
            })
            .then((p) => console.log(`made dir staring with ${p}`));

          mkdirp("public/product_images/" + product._id + "/gallery")
            .catch((err) => {
              console.log(err);
            })
            .then((p) => console.log(`made dir staring with ${p}`));

          mkdirp("public/product_images/" + product._id + "/gallery/thumbs")
            .catch((err) => {
              console.log(err);
            })
            .then((p) => console.log(`made dir staring with ${p}`));

          if (imageFile != "") {
            var productImage = req.files.image;
            var path = "public/product_images/" + product._id + "/" + imageFile;

            // console.log(productImage);
            // console.log('public/product_images/' + product._id + '/' + imageFile );

            productImage.mv(path, function (err) {
              return console.log(err);
            });
          }

          req.flash("success", "product added!");
          res.redirect("/admin/products");
        });
      }
    });
  }
});

/*
 * GET edit product
 */
router.get("/edit-product/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find(function (err, categories) {
    Product.findById(req.params.id, function (err, p) {
      if (err) {
        console.log(err);
        res.redirect("/admin/products");
      } else {
        var galleryDir = "public/product_images/" + p._id + "/gallery";
        var galleryImages = null;

        fs.readdir(galleryDir, function (err, files) {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render("admin/edit_product", {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, "-").toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id,
            });
          }
        });
      }
    });
  });
});

/*
 * POST edit category
 */

router.post("/edit-product/:id", (req, res) => {
  let imageFile = "";
  if (req.files && typeof req.files.image !== "undefined") {
    imageFile = req.files.image.name;
  }

  const valid = validator(req.body);

  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let desc = req.body.desc;
  let price = req.body.price;
  let category = req.body.category;
  let pimage = req.body.pimage;
  let id = req.params.id;

  if (!valid) {
    req.session.errors = errors;
    res.redirect("/admin/products/edit-product/" + id);
  } else {
    Product.findById(id, function (err, p) {
      if (err) console.log(err);

      p.title = title;
      p.slug = slug;
      p.desc = desc;
      p.price = parseFloat(price).toFixed(2);
      p.category = category;
      if (imageFile != "") {
        p.image = imageFile;
      }

      p.save(function (err) {
        if (err) console.log(err);

        if (imageFile != "") {
          if (pimage != "") {
            fs.remove(
              "public/product_images/" + id + "/" + pimage,
              function (err) {
                if (err) console.log(err);
              }
            );
          }

          var productImage = req.files.image;
          var path = "public/product_images/" + id + "/" + imageFile;

          productImage.mv(path, function (err) {
            return console.log(err);
          });
        }

        req.flash("success", "Product edited!");
        res.redirect("/admin/products/edit-product/" + id);
      });
    });
  }
});

/*
 * POST product gallery
 */
router.post("/product-gallery/:id", function (req, res) {
  var productImage = req.files.file;
  var id = req.params.id;
  var path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
  var thumbsPath =
    "public/product_images/" + id + "/gallery/thumbs/" + req.files.file.name;

  productImage.mv(path, function (err) {
    if (err) console.log(err);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(
      function (buf) {
        fs.writeFileSync(thumbsPath, buf);
      }
    );
  });

  res.sendStatus(200);
});

/*
 * GET delete gallery images
 */
router.get("/delete-image/:image", isAdmin, function (req, res) {
  let originalImage =
    "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
  let thumbImage =
    "public/product_images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fs.remove(originalImage, function (err) {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Image deleted!");
          res.redirect("/admin/products/edit-product/" + req.query.id);
        }
      });
    }
  });
});

/*
 * GET delete product
 */

router.get("/delete-product/:id", isAdmin, function (req, res) {
  let id = req.params.id;
  let path = "public/product_images/" + id;

  fs.remove(path, function (err) {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, function (err) {
        console.log(err);
      });

      req.flash("success", "Product deleted!");
      res.redirect("/admin/products");
    }
  });
});

module.exports = router;
