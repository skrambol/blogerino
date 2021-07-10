import { Router } from 'express'

import postRoutes from './routes/post'

const api = Router()

api.use('/post', postRoutes)

api.get('/', (req, res) => {
  res.redirect('/api/ping')
})

api.get('/ping', (req, res) => {
  res.send({message: 'pong'})
})

api.use((req, res) => {
  res.status(404)
    .send({error: `${req.url} not found`})
})


module.exports = api
