import { config } from 'dotenv'
import request from 'supertest'

import makeApp from '../app'

config()
let app
let server

beforeAll(async () => {
  app = await makeApp(process.env.TEST_DB_URL)
  server = app.listen(process.env.TEST_PORT)
})

afterAll(async () => {
  await app.db_conn.close()
  server.close()
})

describe('/', () => {
  it('should return a 404 status with a GET error message when visiting a non-existing route', async () => {
    const res = await request(app).get('/')
    const expected = {message: 'GET / not found'}

    expect(res.status).toBe(404)
    expect(res.body).toEqual(expected)
  })
})
