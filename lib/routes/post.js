import { Router } from 'express'

import post from '../controllers/post'

const api = Router()

api.get('/', post.all)
api.post('/', post.create)
api.get('/:id', post.one)
api.put('/:id', post.update)
api.delete('/:id', post.delete)


export default api
