const mongoose = require("mongoose");

const pageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  content: {
    type: String,
  },
 
});

module.exports = mongoose.model("Page", pageSchema);
