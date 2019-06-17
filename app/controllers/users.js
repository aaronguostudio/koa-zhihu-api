const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')

class UsersCtrl {
  async find (ctx) {
    ctx.body = await User.find();
  }

  async findById (ctx) {
    const user = await User.findById(ctx.params.id)
    if (!user) return ctx.throw(404)
    ctx.body = user
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: {type: 'string', require: true},
    })

    const { name } = ctx.request.body
    const existingUser = await User.findOne({ name })

    // 409 means conflicts
    if (existingUser) return ctx.throw(409)

    const user = await new User( ctx.request.body ).save()
    ctx.body = user
  }

  // manual middleware
  async checkOwner (ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) return ctx.throw(403)
    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: {type: 'string', required: false},
    })
    await User.findByIdAndUpdate( ctx.params.id, ctx.request.body )
    const user = await User.findById(ctx.params.id)
    if (!user) return ctx.throw(404)
    ctx.body = user
  }

  async remove(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) { ctx.throw(404) }
    ctx.status = 204
  }

  async login (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) return ctx.throw(401)
    const { _id, name } = user
    const token = jwt.sign({ _id, name }, secret, { expiresIn: '2h' })
    ctx.body = { token }
  }
}

module.exports = new UsersCtrl()