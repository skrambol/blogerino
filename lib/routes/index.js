import { Router } from 'express'

import { requireAuth } from '../middlewares/auth'
import post_routes from './post'
import user_routes from './user'
import auth_routes from './auth'

const router = Router()

router.use('/auth', auth_routes)
router.use('/post', requireAuth, post_routes)
router.use('/user', requireAuth, user_routes)

router.get('/', (_, res) => {
  res.redirect('/api/ping')
})

router.get('/ping', (_, res) => {
  res.send({message: 'pong'})
})


export default router
