import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { errorHandler, AuthError } from '../util/error_handler'

config()
export const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt

  try {
    if (!token) throw new AuthError('You are not logged in')

    const {id, name} = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {id, name}

    next()
  }
  catch(err) {
    errorHandler(err, res)
  }
}
