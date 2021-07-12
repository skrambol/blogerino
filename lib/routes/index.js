import { Router } from 'express'

import post_routes from './post'

const router = Router()

router.use('/post', post_routes)

router.get('/', (req, res) => {
  res.redirect('/router/ping')
})

router.get('/ping', (req, res) => {
  res.send({message: 'pong'})
})

router.use((req, res) => {
  res.status(404)
    .send({error: `${req.url} not found`})
})


export default router
