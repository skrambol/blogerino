import {config} from 'dotenv'
import jwt from 'jsonwebtoken'

import User from '../models/user'
import {errorHandler, errors} from '../util/error_handler'

config()
const maxAge = 24 * 60 * 60
const createToken = (id, username) => {
  return jwt.sign(
    {id, name: username},
    process.env.JWT_SECRET,
    { expiresIn: maxAge }
  )
}

const login = async (req, res) => {
  const {username, password} = {...req.body}

  if (req.cookies.jwt) return errorHandler(errors.auth('You are already logged in'), res, 401)

  try {
    const user = await User.findOne({username})

    if (!user)
      return errorHandler(errors.auth('Invalid username/password'), res, 401)

    const is_auth = await user.authenticatePassword(password)

    if (!is_auth)
      return errorHandler(errors.auth('Invalid username/password'), res, 401)

    res.cookie(
      'jwt',
      createToken(user._id, user.username),
      {httpOnly: true, maxAge: maxAge * 1000}
    )
    res.json({message: 'Log-in successful'})
  }

  catch(err) {
    errorHandler(err, res)
  }
}

const logout = (req, res) => {
  if (!req.cookies.jwt)
    return errorHandler(errors.auth('You are not logged in'), res, 401)

  res.clearCookie('jwt')
  res.send({message: 'Logout successful'})
}

const signUp = async (req, res) => {
  const new_user = {...req.body}

  if (req.cookies.jwt)
    return errorHandler(errors.auth('You are already logged in'), res, 401)

  if (!new_user.password)
    return errorHandler(errors.notFound('Password'), res, 404)

  if (!User.validatePasswordLength(new_user.password))
    return errorHandler(errors.validator('Password should only be 8-32 characters'), res)

  if (!User.validatePasswordChars(new_user.password))
    return errorHandler(errors.validator('Password should have at least one character, number, and symbol'), res)

  try {
    const {_id, username} = await User.create(new_user)
    res.json({_id, username})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

export default {
  login,
  logout,
  signUp
}
