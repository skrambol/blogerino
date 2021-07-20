import User from '../models/user'
import {errorHandler, MissingParamsError, DataNotFoundError} from '../util/error_handler'
import { paramsBuilder } from '../util'

const update = async (req, res) => {
  const id = req.user.id
  const params = paramsBuilder(req.body, ['name'])

  try {
    const new_user = await User.findByIdAndUpdate( id, params, {new: true, runValidators: true})

    if (!new_user) throw new DataNotFoundError('User')

    res.json({message: 'User update successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}

const updatePassword = async (req, res) => {
  const id = req.user.id
  const { password } = paramsBuilder(req.body, ['password'])

  try {
    if (!password) throw new MissingParamsError('password')
    User.validatePassword(password)

    const user = await User.findById(id)

    if (!user) throw new DataNotFoundError('User')

    user.password = password

    await user.save()
    res.json({message: 'Password change successful'})
  }
  catch(err) {
    errorHandler(err, res)
  }
}


export default {
  update,
  updatePassword
}
