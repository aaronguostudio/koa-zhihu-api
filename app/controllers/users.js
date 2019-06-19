const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')
const mongoose = require('mongoose')

class UsersCtrl {
  async find (ctx) {
    ctx.body = await User.find();
  }

  async findById (ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ? fields.split(';').filter(f => f).map(f => ' +' + f).join('') : ''
    console.log('>selectedFields', selectedFields)
    const user = await User.findById(ctx.params.id).select(selectedFields)
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

  // 可以不用做太深层的校验，否则代码太臃肿
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: {type: 'string', required: false},
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
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

  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) return ctx.throw(404)
    ctx.body = user.following
  }

  async listFollowers (ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }

  async checkUserExist (ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) return ctx.throw(404)
    await next()
  }

  async follow (ctx) {
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    const me = await User.findById(ctx.state.user._id).select('+following')
    if ( !me.following.includes( newId ) ) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  async unfollow (ctx) {
    const unfollowId = mongoose.Types.ObjectId( ctx.params.id )
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.indexOf(unfollowId)
    console.log('>index', index)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

}

module.exports = new UsersCtrl()