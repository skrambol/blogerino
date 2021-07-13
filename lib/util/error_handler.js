export const errorHandler = (err, res, status = 400) => {
  const error = err.errors
    ? Object.keys(err.errors).map(key => ({
      name: err.errors[key].name,
      message: err.errors[key].message
    }))
    : {name: err.name, message: err.message}

  return res.status(status).json(error)
}

const builder = (name, message) => ({ name, message })
const notFound = (data = 'Data') => builder(`${data}NotFoundError`, `${data} not found`)
const validator = (message) => builder('ValidatorError', message)
const auth = (message = 'Unauthorized access') => builder('AuthError', message)

export const errors = {
  builder,
  notFound,
  validator,
  auth
}
