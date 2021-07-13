import jwt from 'jsonwebtoken'

import User from '../models/user'
import {errorHandler, errors} from '../util/error_handler'

const one = async (req, res) => {
  const {id} = req.params

  try {
    const user = await User.findById(id)

    if (!user) return errorHandler(errors.notFound('User'), res, 404)

    delete user.password
    res.json(user)
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const update = async (req, res) => {
  const {id} = req.params
  const new_user = {...req.body}

  try {
    const new_user = await User.findByIdAndUpdate(id, new_user, {new: true, runValidators: true})

    if (!new_user) return errorHandler(errors.notFound('User'), res, 404)

    delete new_user.password
    res.json(new_user)
  }
  catch(err) {
    errorHandler(err, res)
  }
}


export default {
  one,
  update
}
