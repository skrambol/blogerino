import { Router } from 'express'

import user from '../controllers/user'

const api = Router()

api.get('/', user.all)
api.post('/', user.create)
api.get('/:id', user.one)
api.put('/:id', user.update)


export default api
