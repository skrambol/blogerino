import { model, Schema } from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  username: {
    type: String,
    unique: 'Username is already taken',
    required: [true, 'User should have a username'],
    match: [/^[\w]+$/, 'Username should only have letters, characters, or underscores'],
    minLength: [3, 'Username should be at least 3 allowed characters'],
    maxLength: [16, 'Username should be at most 16 allowed characters']
  },
  password: {
    type: String,
    required: [true, 'User should have a password']
  },
  email: {
    type: String,
    unique: 'Email is already taken',
    required: [true, 'User should have an email'],
    match: [/^\w+@\w+\.[a-zA-Z]+$/, 'Email should be a valid email address']
  },
  name: String
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
  return /^(?=.*\w)(?=.*\W).{8,32}/.test(password)
})

const User = model('User', userSchema)

export default User
