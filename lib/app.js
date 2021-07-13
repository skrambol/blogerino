import { config } from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'

import routes from './routes'


const makeApp = async (db_url) => {
  const app = express()
  const mongo_opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }

  await mongoose.connect(db_url, mongo_opts)
  app.db_conn = mongoose.connection

  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use('/api', routes)

  return app
}

export default makeApp
