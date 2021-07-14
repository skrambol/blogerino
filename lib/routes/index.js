import { Router } from 'express'

import { requireAuth } from '../middlewares/auth'
import post_routes from './post'
import user_routes from './user'
import auth_routes from './auth'

const router = Router()

router.use('/auth', auth_routes)
router.use('/post', requireAuth, post_routes)
router.use('/user', requireAuth, user_routes)

router.get('/', (req, res) => {
  res.redirect('/api/ping')
})

router.get('/ping', (req, res) => {
  res.send({message: 'pong'})
})

router.use((req, res) => {
  res.status(404)
    .send({error: `${req.method} ${req.url} not found`})
})


export default router
