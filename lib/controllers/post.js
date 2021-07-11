import Post from '../models/post'

const errorHandler = (err, res) => {
  console.log(err)
  res.status(400).json({error: err.message})
}

const one = (req, res) => {
  const {id} = req.params

  Post.findById(id)
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}

const all = (req, res) => {
  Post.find()
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}

const create = (req, res) => {
  const new_post = {...req.body}

  Post.create(new_post)
    .then(result => res.send(result) )
    .catch(err => errorHandler(err, res))
}

const update = (req, res) => {
  const {id} = req.params
  const new_post = {...req.body}

  console.log(new_post)

  Post.findByIdAndUpdate(id, new_post)
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}

const remove = (req, res) => {
  const {id} = req.params

  Post.findByIdAndDelete(id)
    .then(result => res.send(result))
    .catch(err => errorHandler(err, res))
}


export default {
  one,
  create,
  all,
  update,
  delete: remove
}
