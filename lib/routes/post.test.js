import { config } from 'dotenv'
import request from 'supertest'

import makeApp from '../app'
import User from '../models/user'
import Post from '../models/post'

config()
let app
let server
let token1, token2

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

const testNotLoggedIn = (res) => {
  const expected = {name: 'AuthError', message: 'You are not logged in'}

  expect(res.status).toEqual(401)
  expect(res.body).toEqual(expect.objectContaining(expected))
}

const testTamperedJwt = (res) => {
  const expected = {name: 'JsonWebTokenError', message: 'jwt malformed'}

  expect(res.status).toEqual(400)
  expect(res.body).toEqual(expect.objectContaining(expected))
}

describe('/api/post', () => {
  const user1 = {
    username: 'user1',
    password: '123456a!',
    name: 'user name'
  }

  const user2 = {
    username: 'user2',
    password: '123456a!',
    name: 'user name'
  }

  const posts = [
    {
      title: 'title1',
      body: 'body1',
      subtitle: '',
    },
    {
      title: 'title2',
      body: 'body2',
      subtitle: 'subtitle2',
    },
    {
      title: 'title3',
      body: 'body3',
      subtitle: 'subtitle3',
    }
  ]
  describe('GET /', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id.toString()
      posts[1].user = user2._id = u2._id.toString()

      const p1 = await Post.create(posts[0])
      const p2 = await Post.create(posts[1])
      posts[0]._id = p1._id.toString()
      posts[1]._id = p2._id.toString()

      const res1 = await request(app).post('/api/auth/login').send(user1)
      const res2 = await request(app).post('/api/auth/login').send(user2)
      token1 = res1.headers['set-cookie']
      token2 = res2.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })
    const url = '/api/post/'

    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).get(url)
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).get(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a list of all posts', async () => {
          const res = await request(app).get(url).set('Cookie', token1)
          const expected = posts

          expect(res.status).toEqual(200)
          expect(res.body.length).toEqual(2)
          expect(res.body[0]).toEqual(expect.objectContaining(posts[0]))
          expect(res.body[1]).toEqual(expect.objectContaining(posts[1]))
        })
      })
    })
  })

  describe('POST /', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id.toString()
      posts[1].user = user2._id = u2._id.toString()

      const p1 = await Post.create(posts[0])
      const p2 = await Post.create(posts[1])
      posts[0]._id = p1._id.toString()
      posts[1]._id = p2._id.toString()

      const res1 = await request(app).post('/api/auth/login').send(user1)
      const res2 = await request(app).post('/api/auth/login').send(user2)
      token1 = res1.headers['set-cookie']
      token2 = res2.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })
    const url = '/api/post'

    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).post(url)
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).post(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a ValidatorError if the title is missing', async () => {
          const res = await request(app)
            .post(url)
            .set('Cookie', token1)
            .send({title: '', body: 'body'})
          const expected = {name: 'ValidatorError', message: 'Post should have a title'}

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a ValidatorError if the body is missing', async () => {
          const res = await request(app)
            .post(url)
            .set('Cookie', token1)
            .send({title: 'title', body: ''})
          const expected = {name: 'ValidatorError', message: 'Post should have a body'}

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a ValidatorError if the subtitle is more than 80 characters', async () => {
          const res = await request(app)
            .post(url)
            .set('Cookie', token1)
            .send({
              title: 'title',
              body: 'body',
              subtitle: 'a'.repeat(81)
            })
          const expected = {
            name: 'ValidatorError',
            message: 'Subtitle should be at most 80 characters'
          }

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a success message if all payload are valid', async () => {
          const res = await request(app)
            .post(url)
            .set('Cookie', token1)
            .send({
              title: 'title',
              body: 'body',
              subtitle: 'subtitle'
            })
          const expected = {message: 'Post create successful'}

          expect(res.status).toEqual(201)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })
      })
    })
  })

  describe('PUT /:id', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id.toString()
      posts[1].user = user2._id = u2._id.toString()

      const p1 = await Post.create(posts[0])
      const p2 = await Post.create(posts[1])
      posts[0]._id = p1._id.toString()
      posts[1]._id = p2._id.toString()

      const res1 = await request(app).post('/api/auth/login').send(user1)
      const res2 = await request(app).post('/api/auth/login').send(user2)
      token1 = res1.headers['set-cookie']
      token2 = res2.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })

    const url = '/api/post/'
    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).put(url)
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).put(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a ValidatorError if the title is missing', async () => {
          const res = await request(app)
            .put(url + posts[0]._id.toString())
            .set('Cookie', token1)
            .send({title: '', body: 'body'})
          const expected = {name: 'ValidatorError', message: 'Post should have a title'}

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a ValidatorError if the body is missing', async () => {
          const res = await request(app)
            .put(url + posts[0]._id.toString())
            .set('Cookie', token1)
            .send({title: 'title', body: ''})
          const expected = {name: 'ValidatorError', message: 'Post should have a body'}

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a ValidatorError if the subtitle is more than 80 characters', async () => {
          const res = await request(app)
            .put(url + posts[0]._id.toString())
            .set('Cookie', token1)
            .send({
              title: 'title',
              body: 'body',
              subtitle: 'a'.repeat(81)
            })
          const expected = {
            name: 'ValidatorError',
            message: 'Subtitle should be at most 80 characters'
          }

          expect(res.status).toEqual(400)
          expect(res.body[0]).toEqual(expect.objectContaining(expected))
        })

        it('should return a PostNotFoundError if :id does not exist in database', async () => {
          const res = await request(app).put(url + '1234567890qw').set('Cookie', token1)
          const expected = {name: 'PostNotFoundError', message: 'Post not found'}

          expect(res.status).toEqual(404)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a CastError if :id is not 12 bytes', async () => {
          const res = await request(app).put(url + '12w').set('Cookie', token1)
          const expected = {name: 'CastError'}

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return an AuthError if the post.user !== session user', async () => {
          const res = await request(app)
            .put(url + posts[0]._id.toString())
            .set('Cookie', token2)
            .send({
              title: 'title',
              body: 'body',
              subtitle: 'subtitle'
            })
          const expected = {name: 'AuthError', message: 'User cannot edit other users\' post'}

          expect(res.status).toEqual(401)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a success message if user is editing own post and it should update the database entry', async () => {
          const edited_params = {title: 'hello', body: 'world', subtitle: '!'}
          const res = await request(app).put(url + posts[0]._id.toString()).set('Cookie', token1).send(edited_params)
          const expected = {message: 'Post update successful'}
          const new_post = await Post.findById(posts[0]._id)

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
          expect(new_post).toEqual(expect.objectContaining(edited_params))
          expect(new_post._id.toString()).toEqual(posts[0]._id.toString())
        })
      })
    })
  })

  describe('GET /:id', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id
      posts[1].user = user2._id = u2._id

      const p1 = await Post.create(posts[0])
      const p2 = await Post.create(posts[1])
      posts[0]._id = p1._id
      posts[1]._id = p2._id

      const res1 = await request(app).post('/api/auth/login').send(user1)
      token1 = res1.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })
    const url = '/api/post/'

    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).get(url + '1234')
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).get(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a PostNotFoundError if :id does not exist in database', async () => {
          const res = await request(app).get(url + '1234567890qw').set('Cookie', token1)
          const expected = {name: 'PostNotFoundError', message: 'Post not found'}

          expect(res.status).toEqual(404)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a CastError if :id is not 12 bytes', async () => {
          const res = await request(app).get(url + '12w').set('Cookie', token1)
          const expected = {name: 'CastError'}

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a post with the given :id', async () => {
          const res = await request(app).get(url + posts[0]._id).set('Cookie', token1)
          const expected = posts[0]

          expect(res.status).toEqual(200)
          expect(res.body.title).toEqual(expected.title)
          expect(res.body.body).toEqual(expected.body)
          expect(res.body.subtitle).toEqual(expected.subtitle)
          expect(res.body._id.toString()).toEqual(expected._id.toString())
          expect(res.body.user.toString()).toEqual(user1._id.toString())
        })

        it('should return a post of another user with the given :id', async () => {
          const res = await request(app).get(url + posts[1]._id).set('Cookie', token1)
          const expected = posts[1]

          expect(res.status).toEqual(200)
          expect(res.body.title).toEqual(expected.title)
          expect(res.body.body).toEqual(expected.body)
          expect(res.body.subtitle).toEqual(expected.subtitle)
          expect(res.body._id.toString()).toEqual(expected._id.toString())
          expect(res.body.user.toString()).not.toEqual(user1._id.toString())
        })
      })
    })
  })

  describe('DELETE /:id', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id
      posts[1].user = user2._id = u2._id

      const p1 = await Post.create(posts[0])
      posts[0]._id = p1._id

      const res1 = await request(app).post('/api/auth/login').send(user1)
      const res2 = await request(app).post('/api/auth/login').send(user2)
      token1 = res1.headers['set-cookie']
      token2 = res2.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })
    const url = '/api/post/'

    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).delete(url + '1234')
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).delete(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a PostNotFoundError if :id does not exist in database', async () => {
          const res = await request(app).delete(url + '1234567890qw').set('Cookie', token1)
          const expected = {name: 'PostNotFoundError', message: 'Post not found'}

          expect(res.status).toEqual(404)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a CastError if :id is not 12 bytes', async () => {
          const res = await request(app).delete(url + '12w').set('Cookie', token1)
          const expected = {name: 'CastError'}

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return an AuthError if the post.user !== session user', async () => {
          const res = await request(app).delete(url + posts[0]._id).set('Cookie', token2)
          const expected = {name: 'AuthError', message: 'User cannot delete other users\' post'}

          expect(res.status).toEqual(401)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return a post of another user with the given :id', async () => {
          const res = await request(app).delete(url + posts[0]._id).set('Cookie', token1)
          const expected = {message: 'Post delete successful'}
          const post = await Post.findById(posts[0]._id)

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expect.objectContaining(expected))
          expect(post).toEqual(null)
        })
      })
    })
  })

  // describe('GET /user/:user', () => {})
  describe('GET /user/:id', () => {
    beforeAll(async () => {
      await Post.createCollection()
      const u1 = await User.create(user1)
      const u2 = await User.create(user2)
      posts[0].user = user1._id = u1._id.toString()
      posts[1].user = user2._id = u2._id.toString()
      posts[2].user = user1._id = u1._id.toString()

      const p1 = await Post.create(posts[0])
      const p2 = await Post.create(posts[1])
      const p3 = await Post.create(posts[2])
      posts[0]._id = p1._id.toString()
      posts[1]._id = p2._id.toString()
      posts[2]._id = p3._id.toString()

      const res1 = await request(app).post('/api/auth/login').send(user1)
      token1 = res1.headers['set-cookie']
    })

    afterAll(async () =>{
      await User.collection.drop()
      await Post.collection.drop()
    })
    const url = '/api/post/user/'

    it('should return an AuthError if the user is not logged in', async () => {
      const res = await request(app).get(url + '1234')
      testNotLoggedIn(res)
    })

    describe('when logged in', () => {
      it('should return a JsonWebTokenError if token is tampered', async () => {
        const res = await request(app).get(url).set('Cookie', ['jwt=secretjwt'])
        testTamperedJwt(res)
      })

      describe('with a verified token', () => {
        it('should return a CastError if :id is not 12 bytes', async () => {
          const res = await request(app).get(url + '12w').set('Cookie', token1)
          const expected = {name: 'CastError'}

          expect(res.status).toEqual(400)
          expect(res.body).toEqual(expect.objectContaining(expected))
        })

        it('should return an empty array if :id does not exist in database or has no posts', async () => {
          const res = await request(app).get(url + '1234567890qw').set('Cookie', token1)
          const expected = []

          expect(res.status).toEqual(200)
          expect(res.body).toEqual(expected)
        })

        it('should return all the posts of user :id', async () => {
          const res = await request(app).get(url + user1._id).set('Cookie', token1)
          const expected = [posts[0], posts[2]]

          expect(res.status).toEqual(200)
          expect(res.body.length).toEqual(2)
          expect(res.body[0]).toEqual(expect.objectContaining(expected[0]))
          expect(res.body[1]).toEqual(expect.objectContaining(expected[1]))
        })

        it('should return all the posts of another user with the given :id', async () => {
          const res = await request(app).get(url + user2._id).set('Cookie', token1)
          const expected = [ posts[1] ]

          expect(res.status).toEqual(200)
          expect(res.body.length).toEqual(1)
          expect(res.body[0]).toEqual(expect.objectContaining(expected[0]))
        })
      })
    })
  })
})
