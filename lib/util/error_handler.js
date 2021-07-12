export const errorHandler = (err, res, status = 400) => {
  console.log(err)

  const error = err.errors
    ? Object.keys(err.errors).map(key => ({
      name: err.errors[key].name,
      message: err.errors[key].message
    }))
    : {name: err.name, error: err.message}

  res.status(status).json(error)
}

const builder = (name, message) => ({ name, message })
const notFound = (data = 'Data') => builder(`${data}NotFoundError`, `${data} not found`)
const validator = (message) => builder('ValidatorError', message)

export const errors = {
  notFound,
  validator
}
