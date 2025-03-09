const { Schema } = require("mongoose");

const blogSchema = new Schema({
    blog_title: String,
    blog_description: String,
    blog_keywords: String,
    blog_lead_img: String,
    content: String,
    author: String,
    publish: { type: Boolean, default: false}
})

module.exports = blogSchema;