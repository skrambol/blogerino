import {config} from 'dotenv'
import jwt from 'jsonwebtoken'

import User from '../models/user'
import {errorHandler, AuthError, ValidatorError, MissingParamsError} from '../util/error_handler'

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

  try {
    const user = await User.findOne({username})

    if (req.cookies.jwt)
      throw new AuthError('You are already logged in')

    if (!user)
      throw new AuthError('Incorrect username/password')

    const is_auth = await user.authenticatePassword(password)

    if (!is_auth)
      throw new AuthError('Incorrect username/password')

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
  try {
    if (!req.cookies.jwt)
      throw new AuthError('You are not logged in')

    res.clearCookie('jwt')
    res.send({message: 'Logout successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const signUp = async (req, res) => {
  const new_user = {...req.body}

  try {
    if (req.cookies.jwt)
      throw new AuthError('You are already logged in')

    if (!new_user.password)
      throw new MissingParamsError('password')

    User.validatePassword(new_user.password)
    await User.create(new_user)
    res.status(201).json({message: 'Sign up successful'})
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
