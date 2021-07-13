import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { errorHandler, errors } from '../util/error_handler'

config()
export const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) return errorHandler(errors.auth('You are not logged in'), res, 401)

  try {
    const is_auth = await jwt.verify(token, process.env.JWT_SECRET)
    next()
  }
  catch(err) {
    errorHandler(err, res)
  }
}
