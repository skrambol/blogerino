import { config } from 'dotenv'
import request from 'supertest'

import makeApp from '../app'
import User from '../models/user'

config()
let app
let server
let token

beforeAll(async () => {
  app = await makeApp(process.env.TEST_DB_URL)
  server = app.listen(process.env.TEST_PORT)
})

afterAll(async () => {
  await app.db_conn.close()
  server.close()
})

const setToken = async (cookie) => {
  token = cookie
}

const testNotLoggedIn = async (url) => {
  const res = await request(app).put(url).send({password: '1234567a'})
  const expected = {name: 'AuthError', message: 'You are not logged in'}

  expect(res.status).toEqual(401)
  expect(res.body).toEqual(expect.objectContaining(expected))
}

const testTamperedJwt = async (url) => {
  const res = await request(app).put(url)
    .set('Cookie', ['jwt=secretjwt'])
    .send({password: ''})
  const expected = {name: 'JsonWebTokenError', message: 'jwt malformed'}

  expect(res.status).toEqual(400)
  expect(res.body).toEqual(expect.objectContaining(expected))
}

describe('/api/user', () => {
  const user = {
    username: 'my_user',
    password: '123456a!',
    name: 'my_name'
  }

  beforeAll(async () => {
    await User.create(user)

    const res = await request(app).post('/api/auth/login').send(user)
    await setToken(res.headers['set-cookie'])
  })

  afterAll(async () =>{
    await User.collection.drop()
  })

  describe('PUT /update', () => {
    const url = '/api/user/update'
    it('should return an AuthError if the user is not logged in', async () => testNotLoggedIn(url))

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => testTamperedJwt(url))

      describe('with a verified token', () => {
        it('should return a ValidatorError if name.length is greater than 24', async () => {
          const res = await request(app)
            .put(url).
            set('Cookie', token).
            send({name: 'qwertyuiopasdfghjklzxcvbnm'})
          const expected = {name: 'ValidatorError', message: 'Name should be at most 24 characters'}

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a success message and not change username/password even if it is in the payload', async () => {
          const res = await request(app)
            .put(url).
            set('Cookie', token).
            send({username: 'new_user', password: 'new_password1!'})
          const expected = {message: 'User update successful'}
          const new_user = await User.findOne({username: user.username})
          const is_auth_password = await new_user.authenticatePassword(user.password)

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
          expect(new_user.username).toEqual(user.username)
          expect(is_auth_password).toEqual(true)
        })

        it('should return a success message if there is no name in payload and not change the name', async () => {
          const res = await request(app).put(url).set('Cookie', token).send({})
          const expected = {message: 'User update successful'}
          const new_user = await User.findOne({username: user.username})

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
          expect(new_user.name).toEqual(user.name)
        })

        it('should return a success message and change the user.name', async () => {
          const res = await request(app).put(url).set('Cookie', token).send({name: 'new_name'})
          const expected = {message: 'User update successful'}
          const new_user = await User.findOne({username: user.username})

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
          expect(new_user.name).toEqual('new_name')
        })
      })
    })
  })

  describe('PUT /password', () => {
    const url = '/api/user/password'
    it('should return an AuthError if the user is not logged in', async () => testNotLoggedIn(url))

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => testTamperedJwt(url))

      describe('with a verified token', () => {
        it('should return a MissingParamsError if password is blank or not in from payload', async () => {
          const res = await request(app).put(url).set('Cookie', token).send({password: ''})
          const expected = {
            name: 'MissingParamsError',
            message: 'password is missing or not supplied'
          }

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a ValidatorError if password is invalid', async () => {
          const res = await request(app).put(url).set('Cookie', token).send({password: '1234567'})
          const expected = {name: 'ValidatorError', message: 'Password should only be 8-32 characters'}

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a success message if password is valid', async () => {
          const res = await request(app).put(url).set('Cookie', token).send({password: 'qweasd1!'})
          const expected = {message: 'Password change successful'}

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })
      })
    })
  })
})
