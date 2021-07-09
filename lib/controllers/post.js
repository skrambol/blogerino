import { Router } from 'express'

import Post from '../models/post'

const errorHandler = err => {
  console.log(err)
  res.status(500).send(err.message)
}

const one = (req, res) => {
  const {id} = req.params

  Post.findById(id)
    .then(result => res.send(result))
    .catch(errorHandler)
}

const all = (req, res) => {
  Post.find()
    .then(result => res.send(result))
    .catch(errorHandler)
}

const create = (req, res) => {
  const new_post = {...req.body}

  Post.create(new_post)
    .then(result => res.send(result) )
    .catch(errorHandler)
}

const update = (req, res) => {
  const {id} = req.params
  const new_post = {...req.body}

  console.log(new_post)

  Post.findByIdAndUpdate(id, new_post)
    .then(result => res.send(result))
    .catch(errorHandler)
}

const remove = (req, res) => {
  const {id} = req.params

  Post.findByIdAndDelete(id)
    .then(result => res.send(result))
    .catch(errorHandler)
}


module.exports = {
  one,
  create,
  all,
  update,
  delete: remove
}
