import Post from '../models/post'
import {errorHandler, errors} from '../util/error_handler'

const one = (req, res) => {
  const {id} = req.params

  Post.findById(id)
    .then(result => {
      if (!result) return errorHandler(errors.notFound('Post'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}

const all = (req, res) => {
  Post.find()
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}

const create = (req, res) => {
  const new_post = {...req.body}

  Post.create(new_post)
    .then(result => res.send(result) )
    .catch(err => errorHandler(err, res))
}

const update = (req, res) => {
  const {id} = req.params
  const new_post = {...req.body}

  Post.findByIdAndUpdate(id, new_post, {new: true, runValidators: true})
    .then(result => {
      if (!result) return errorHandler(errors.notFound('Post'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}

const remove = (req, res) => {
  const {id} = req.params

  Post.findByIdAndDelete(id)
    .then(result => {
      if (!result) return errorHandler(errors.notFound('Post'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}


export default {
  one,
  create,
  all,
  update,
  delete: remove
}
