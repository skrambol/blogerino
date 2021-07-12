import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { config } from 'dotenv'

import routes from './lib/routes'

config()
const app = express()
const PORT = process.env.PORT || 3000
const mongo_opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

mongoose.connect(process.env.DB_URL, mongo_opts)
  .then(res => app.listen(PORT, console.log(`${process.env.APP_NAME} is listening at ${PORT}`)))
  .catch(err => console.error(err))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', routes)
