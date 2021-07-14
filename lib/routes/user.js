import { Router } from 'express'

import user from '../controllers/user'

const api = Router()

api.put('/password', user.updatePassword)
api.put('/update', user.update)


export default api
