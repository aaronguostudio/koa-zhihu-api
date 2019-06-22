const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')
const { minPerPage, defaultPerPage } = require('../config')

class TopicsCtrl {
  async find (ctx) {
    const { per_page = defaultPerPage } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, minPerPage)
    ctx.body = await Topic
                      .find({ name: new RegExp(ctx.query.q, 'i') })
                      .limit(perPage)
                      .skip(page * perPage)
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    if (!topic) return ctx.throw(404)
    ctx.body = topic
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) return ctx.throw(404)
    ctx.body = topic
  }

  async checkTopicExist (ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) return ctx.throw(404)
    await next()
  }

  async listFollowers (ctx) {
    const users = await User.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }

  async listQuestions (ctx) {
    const questions = await Question.find({ topics: ctx.params.id })
    ctx.body = questions
  }
}

module.exports = new TopicsCtrl()