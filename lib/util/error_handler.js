export const errorHandler = (err, res, status) => {
  const error = err.errors
    ? Object.keys(err.errors).map(key => ({
      name: err.errors[key].name,
      message: err.errors[key].message
    }))
    : {name: err.name, message: err.message}

  status = getStatus(err)

  return res.status(status).json(error)
}

const builder = (name, message) => ({ name, message })
const notFound = (data = 'Data') => builder(`${data}NotFoundError`, `${data} not found`)
const validator = (message) => builder('ValidatorError', message)
const auth = (message = 'Unauthorized access') => builder('AuthError', message)

class CustomError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidatorError extends CustomError { }
export class DataNotFoundError extends CustomError {
  constructor(name) {
    super(`${name} not found`)
    this.name = `${name}NotFoundError`
  }
}
export class MissingParamsError extends CustomError {
  constructor(name) {
    super(`${name} is missing or not supplied`)
  }
}
export class AuthError extends CustomError { }

const getStatus = (err) => {
  if (err instanceof ValidatorError) return 400
  if (err instanceof MissingParamsError) return 400
  if (err instanceof AuthError) return 401
  if (err instanceof DataNotFoundError) return 404

  return 400
}

export const errors = {
  builder,
  notFound,
  validator,
  auth
}
