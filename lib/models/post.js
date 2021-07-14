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
  subtitle: {
    type: String,
    maxLength: [80, 'Subtitle should be at most 80 characters']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post should have a user']
  }
}, {timestamps: true})

const Post = model('Post', postSchema)

export default Post
