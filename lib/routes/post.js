import { Router } from 'express'

import post from '../controllers/post'

const api = Router()

api.get('/', post.all)
api.post('/', post.create)
api.get('/:id', post.one)
api.put('/:id', post.update)
api.delete('/:id', post.delete)
api.get('/user/:user', post.getAllFromUser)


export default api
