import { model, Schema } from 'mongoose'

const required = true

const postSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Post should have a title']
  },
  body: {
    type: String,
    required: [true, 'Post should have a body']
  },
  subtitle: String
}, {timestamps: true})

const Post = model('Post', postSchema)

module.exports = Post
