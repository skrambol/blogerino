import { model, Schema } from 'mongoose'

const required = true

const postSchema = new Schema({
  title: {type: String, required},
  subtitle: String,
  body: {type: String, required}
}, {timestamps: true})

const Post = model('Post', postSchema)

module.exports = Post
