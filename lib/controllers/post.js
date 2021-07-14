import jwt from 'jsonwebtoken'

import Post from '../models/post'
import {errorHandler, DataNotFoundError, AuthError, errors} from '../util/error_handler'
import {paramsBuilder} from '../util/'

const one = async (req, res) => {
  const {id} = req.params

  try {
    const post = await Post.findById(id)
    if (!post) throw new DataNotFoundError('Post')

    res.json(post)
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const all = async (req, res) => {
  try {
    const posts = await Post.find()
    return res.json(posts)
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const create = async (req, res) => {
  const user = jwt.decode(req.cookies.jwt).id
  const params = paramsBuilder(
    {...req.body, user},
    ['title', 'body', 'subtitle', 'user']
  )

  try {
    const post = await Post.create(params)
    res.status(201).json({message: 'Post create successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const update = async (req, res) => {
  const {id} = req.params
  const user = jwt.decode(req.cookies.jwt).id
  const params = paramsBuilder({...req.body, user}, ['title', 'body', 'subtitle', 'user'])

  try {
    const post = await Post.findById(id)
    if (!post) throw new DataNotFoundError('Post')

    if (post.user.toString() !== user) throw new AuthError('User cannot edit other users\' post')

    await Post.updateOne({_id: post._id}, params, {timestamps: true, runValidators: true})
    res.json({message: 'Post update successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const remove = async (req, res) => {
  const {id} = req.params
  const user = jwt.decode(req.cookies.jwt).id

  try {
    const post = await Post.findById(id)
    if (!post) throw new DataNotFoundError('Post')

    if (post.user.toString() !== user) throw new AuthError('User cannot delete other users\' post')

    await Post.deleteOne({_id: post._id})
    res.json({message: 'Post delete successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const getAllFromUser = async (req, res) => {
  const {user} = req.params

  try {
    const posts = await Post.find({user})
    res.json(posts)
  }
  catch(err) {
    errorHandler(err, res)
  }
}


export default {
  one,
  create,
  all,
  update,
  delete: remove,
  getAllFromUser
}
