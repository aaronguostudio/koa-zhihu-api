const Answer = require('../models/answers')
const Question = require('../models/questions')
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { secret, minPerPage, defaultPerPage } = require('../config')
const mongoose = require('mongoose')

class UsersCtrl {
  async find (ctx) {
    const { per_page = defaultPerPage } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, minPerPage)
    ctx.body = await User
                      .find({ name: new RegExp(ctx.query.q, 'i') })
                      .limit(perPage)
                      .skip(page * perPage)
  }

  async findById (ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ? fields.split(';').filter(f => f).map(f => ' +' + f).join('') : ''
    const populateStr = fields ? fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') return 'employments.company employments.job'
      if (f === 'educations') return 'educations.school educations.major'
      return f
    }).join(' ') : ''
    const user = await User
                        .findById(ctx.params.id)
                        .populate(populateStr)
                        .select(selectedFields)
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
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  async followTopic (ctx) {
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if ( !me.followingTopics.includes( newId ) ) {
      me.followingTopics.push( ctx.params.id )
      me.save()
    }
    ctx.status = 204
  }

  async unfollowTopic (ctx) {
    const unfollowId = mongoose.Types.ObjectId( ctx.params.id )
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.indexOf(unfollowId)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  async listFollowingTopics (ctx) {
    const user = await User
                        .findById(ctx.params.id)
                        .select('+followingTopics')
                        .populate('followingTopics')
    if (!user) return ctx.throw(404)
    ctx.body = user.followingTopics
  }

  async listQuestions (ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }

  async listLikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) return ctx.throw(404)
    ctx.body = user.likingAnswers
  }

  async likeAnswer (ctx, next) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+likingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )

    if (!me.likingAnswers.includes( newId )) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  async unlikeAnswer (ctx) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+likingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    const index = me.likingAnswers.indexOf( newId)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }

  async listDislikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) return ctx.throw(404)
    ctx.body = user.dislikingAnswers
  }

  async dislikeAnswer (ctx, next) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+dislikingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    if (!me.dislikingAnswers.includes( newId )) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  async undislikeAnswer (ctx) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+dislikingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    const index = me.dislikingAnswers.indexOf( newId)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  async listCollectiongAnswers (ctx) {
    console.log('>>listCollectiongAnswers')
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
    if (!user) return ctx.throw(404)
    ctx.body = user.collectingAnswers
  }

  async collectAnswer (ctx, next) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+collectingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    if (!me.collectingAnswers.includes( newId )) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  async uncollectAnswer (ctx) {
    const uid = ctx.state.user._id
    const me = await User.findById(uid).select('+collectingAnswers')
    const newId = mongoose.Types.ObjectId( ctx.params.id )
    const index = me.collectingAnswers.indexOf( newId)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

}

module.exports = new UsersCtrl()