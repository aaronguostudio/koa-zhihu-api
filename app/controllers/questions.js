const Question = require('../models/questions')
const { minPerPage, defaultPerPage } = require('../config')

class QuestionsCtrl {
  async find (ctx) {
    const { per_page = defaultPerPage } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, minPerPage)
    const q = new RegExp(ctx.query.q, 'i')

    ctx.body = await Question
                      .find({ $or: [{ title: q}, { description: q }] })
                      .limit(perPage)
                      .skip(page * perPage)

  }

  async checkQuestionExist (ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    ctx.state.question = question
    if (!question) return ctx.throw(404)
    await next()
  }

  async checkQuestioner (ctx, next) {
    const { question } = ctx.state
    if (question.questioner.toString() !== ctx.state.user._id) return ctx.throw(404)
    await next()
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
    if (!question) return ctx.throw(404)
    ctx.body = question
  }

  async create (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false }
    })

    const question = await new Question({
                                 ...ctx.request.body,
                                 questioner: ctx.state.user._id
                               }).save()
    ctx.body = question
  }

  async update (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false }
    })
    await ctx.state.question.update(ctx.request.body)
    const question = await Question.findById(ctx.state.question.id)
    ctx.body = question
  }

  async remove (ctx) {
    await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new QuestionsCtrl()