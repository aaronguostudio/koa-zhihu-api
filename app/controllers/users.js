const User = require('../models/users')

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
    })
    const user = await new User( ctx.request.body ).save()
    ctx.body = user
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
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
}

module.exports = new UsersCtrl()