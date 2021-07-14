import { model, Schema } from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'
import bcrypt from 'bcrypt'

import { ValidatorError } from '../util/error_handler'

const userSchema = new Schema({
  username: {
    type: String,
    unique: 'Username is already taken',
    required: [true, 'User should have a username'],
    match: [/^[A-Za-z_][\w]+$/, 'Username should only have letters, numbers, or underscores'],
    minLength: [3, 'Username should be at least 3 allowed characters'],
    maxLength: [16, 'Username should be at most 16 allowed characters']
  },
  password: {
    type: String,
    required: [true, 'User should have a password']
  },
  name: {
    type: String,
    default: '',
    maxLength: [24, 'Name should be at most 24 characters']
  }
}, {timestamps: true})

userSchema.plugin(beautifyUnique)
userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(this.password, salt)

  this.password = hash
  next()
})

userSchema.static('validatePasswordLength', password => {
  return password.length >= 8 && password.length <= 32
})

userSchema.static('validatePasswordChars', password => {
  return /^(?=.*\d)(?=.*[A-Za-z])(?=.*\W).{8,32}/.test(password)
})

userSchema.static('validatePassword', password => {
  if ( !User.validatePasswordLength(password) )
    throw new ValidatorError('Password should only be 8-32 characters')

  if ( !User.validatePasswordChars(password) )
    throw new ValidatorError('Password should have at least one character, number, and symbol')

  return true
})

userSchema.methods.authenticatePassword = async function(input) {
  return await bcrypt.compare(input, this.password)
}

const User = model('User', userSchema)

export default User
