import { Router } from 'express'

import auth from '../controllers/auth'

const api = Router()

api.post('/login', auth.login)
api.post('/signup', auth.signUp)
api.delete('/logout', auth.logout)


export default api
