const { default: mongoose } = require("mongoose");
const blogSchema = require("../schemas/blog-schema");

const Blog = mongoose.model("Blog", blogSchema)

module.exports = Blog;
