import User from '../models/user'
import {errorHandler, errors} from '../util/error_handler'

const one = (req, res) => {
  const {id} = req.params

  User.findById(id)
    .then(result => {
      if (!result) return errorHandler(errors.notFound('User'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}

const all = (req, res) => {
  User.find()
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}

const create = (req, res) => {
  const new_user = {...req.body}

  if (!User.validatePasswordLength(new_user.password))
    return errorHandler(errors.validator('Password should only be 8-32 characters'), res)

  if (!User.validatePasswordChars(new_user.password))
    return errorHandler(errors.validator('Password should have at least one character, number, and symbol'), res)

  User.create(new_user)
    .then(result => res.send(result) )
    .catch(err => errorHandler(err, res))
}

const update = (req, res) => {
  const {id} = req.params
  const new_post = {...req.body}

  User.findByIdAndUpdate(id, new_post, {new: true, runValidators: true})
    .then(result => {
      if (!result) return errorHandler(errors.notFound('User'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}

const remove = (req, res) => {
  const {id} = req.params

  User.findByIdAndDelete(id)
    .then(result => {
      if (!result) return errorHandler(errors.notFound('User'), res, 404)
      res.send(result)
    })
    .catch(err => errorHandler(err, res))
}


export default {
  one,
  create,
  all,
  update,
}
