import { config } from 'dotenv'
import request from 'supertest'

import makeApp from '../app'
import User from '../models/user'

config()
const user = {
  username: 'qwe',
  password: '123456a!',
  name: ''
}
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

describe('/api/auth', () => {

  afterAll(async () => {
    await User.collection.drop()
  })

  describe('POST /signup', () => {
    const url = '/api/auth/signup'
    it('should return a MissingParamsError if password is blank or not in the payload', async () => {
      const res = await request(app).post(url).send({username: '', password: ''})
      const expected = {name: 'MissingParamsError', message: 'password is missing or not supplied'}

      expect(res.status).toEqual(400)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return a ValidatorError if password is less than 8 characters', async () => {
      const res = await request(app).post(url).send({username: '', password: '1234567'})
      const expected = {name: 'ValidatorError', message: 'Password should only be 8-32 characters'}

      expect(res.status).toEqual(400)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return a ValidatorError if password is greater than 32 characters', async () => {
      const res = await request(app).post(url).send({username: '', password: 'abcdefghijklmnopqrstuvwxyz1234567'})
      const expected = {name: 'ValidatorError', message: 'Password should only be 8-32 characters'}

      expect(res.status).toEqual(400)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    describe('with a password length of 8', () => {
      it('should return a ValidatorError if password only contains numbers', async () => {
        const res = await request(app).post(url).send({username: '', password: '12345678'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if password only contains letters', async () => {
        const res = await request(app).post(url).send({username: '', password: 'qwertyui'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if password only contains symbols', async () => {
        const res = await request(app).post(url).send({username: '', password: '!@#$%^&*'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if password does not contain numbers', async () => {
        const res = await request(app).post(url).send({username: '', password: 'a@#$%^&*'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if password does not contain letters', async () => {
        const res = await request(app).post(url).send({username: '', password: '123#%^&*'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if password does not contain symbols', async () => {
        const res = await request(app).post(url).send({username: '', password: '1234abcd'})
        const expected = {
          name: 'ValidatorError',
          message: 'Password should have at least one character, number, and symbol'
        }

        expect(res.status).toEqual(400)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })
    })

    describe('with a valid password', () => {
      it('should return a ValidatorError if username is blank', async () => {
        const res = await request(app).post(url).send({username: '', password: '123456a!'})
        const expected = {name: 'ValidatorError', message: 'User should have a username'}

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if username.length is less than 3', async () => {
        const res = await request(app).post(url).send({username: 'qw', password: '123456a!'})
        const expected = {
          name: 'ValidatorError',
          message: 'Username should be at least 3 allowed characters'
        }

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if username.length is greater than 16', async () => {
        const res = await request(app).post(url)
          .send({username: 'abcdefghijklmnopq', password: '123456a!'})
        const expected = {
          name: 'ValidatorError',
          message: 'Username should be at most 16 allowed characters'
        }

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if username contains symbols except _', async () => {
        const res = await request(app).post(url)
          .send({username: 'q-q', password: '123456a!'})
        const expected = {
          name: 'ValidatorError',
          message: 'Username should only have letters, numbers, or underscores'
        }

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })
    })

    describe('with a valid username and password', () => {
      it('should return an AuthError if currently logged in', async () => {
        const res = await request(app)
          .post(url)
          .set('cookie', ['jwt=secretjwt'])
          .send(user)
        const expected = {name:'AuthError', message: 'You are already logged in'}

        expect(res.status).toEqual(401)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if name.length is greater than 32', async () => {
        const res = await request(app).post(url).send({
          ...user,
          name: 'abcdefghijklmnopqrstuvwxy'
        })
        const expected = {name: 'ValidatorError', message: 'Name should be at most 24 characters'}

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })

      it('should return a success message name if user is not in the database', async () => {
        const test_user = await User.findOne({username: user.username})
        const res = await request(app).post(url).send(user)
        const expected = {message: 'Sign up successful'}

        expect(test_user).toEqual(null)
        expect(res.status).toEqual(201)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a success message name if user is not in the database, even with duplicate name', async () => {
        const { name } = await User.findOne()
        const res = await request(app).post(url).send({...user, name, username: 'new_user'})
        const dupes = await User.find({name})
        const expected = {message: 'Sign up successful'}

        expect(dupes.length).toBeGreaterThan(1)
        expect(dupes[0].name).toEqual(dupes[1].name)
        expect(dupes[0].username).not.toEqual(dupes[1].username)
        expect(res.status).toEqual(201)
        expect(res.body).toEqual(expect.objectContaining(expected))
      })

      it('should return a ValidatorError if username is already taken', async () => {
        const res = await request(app).post(url).send(user)
        const expected = {name: 'ValidatorError', message: 'Username is already taken'}

        expect(res.status).toEqual(400)
        expect(res.body[0]).toEqual(expect.objectContaining(expected))
      })
    })
  })

  describe('POST /api/auth/login', () => {
    const url = '/api/auth/login'
    it('should return an AuthError if the username is blank', async () => {
      const res = await request(app).post(url).send({username: '', password: 'q'})
      const expected = {name: 'AuthError', message: 'Incorrect username/password'}

      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return an AuthError if the password is blank', async () => {
      const res = await request(app).post(url).send({username: 'q', password: ''})
      const expected = {name: 'AuthError', message: 'Incorrect username/password'}

      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return an AuthError if the user does not exist in the database', async () => {
      const {username, password} = {username: 'xyz', password: '123456a!'}
      const test_user = await User.findOne({username})
      const res = await request(app).post(url).send({username, password})
      const expected = {name: 'AuthError', message: 'Incorrect username/password'}

      expect(test_user).toEqual(null)
      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return an AuthError if the user exists but entered the wrong password', async () => {
      const res = await request(app).post(url).send({...user, password: 'wrong_password'})
      const expected = {name: 'AuthError', message: 'Incorrect username/password'}

      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return a success message if the user exists in the database', async () => {
      const res = await request(app).post(url).send(user)
      const expected = {message: 'Log-in successful'}

      expect(res.status).toEqual(200)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return an AuthError if user is already logged in', async () => {
      const res = await request(app).post(url)
        .set('cookie', ['jwt=secretjwt'])
        .send(user)
      const expected = {name: 'AuthError', message: 'You are already logged in'}

      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })
  })

  describe('DELETE /api/auth/logout', () => {
    const url = '/api/auth/logout'
    it('should return an AuthError if user is not logged in', async () => {
      const res = await request(app).delete(url)
      const expected = {name: 'AuthError', message: 'You are not logged in'}

      expect(res.status).toEqual(401)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })

    it('should return a success message if user is logged in', async () => {
      const res = await request(app).delete(url).set('Cookie', ['jwt=secretjwt'])
      const expected = {message: 'Logout successful'}

      expect(res.status).toEqual(200)
      expect(res.body).toEqual(expect.objectContaining(expected))
    })
  })
})
