const Answer = require('../models/answers')
const Question = require('../models/questions')
const { minPerPage, defaultPerPage } = require('../config')

class AnswersCtrl {
  async find (ctx) {
    const { per_page = defaultPerPage } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, minPerPage)
    const q = new RegExp(ctx.query.q, 'i')

    ctx.body = await Answer
                      .find({ content: q, questionId: ctx.params.questionId })
                      .limit(perPage)
                      .skip(page * perPage)
  }

  async checkQuestionExist (ctx, next) {
    const question = await Question.findById(ctx.params.questionId)
    if (!question) return ctx.throw(404, 'Question is not exist')
    await next()
  }

  async checkAnswerExist (ctx, next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')
    if (!answer) return ctx.throw(404, 'Answer is not found')

    // skip if no questionId provided in order to user it in liking and disliking
    if (ctx.params.questionId && (answer.questionId !== ctx.params.questionId))
      return ctx.throw(404, 'This answer does not match the question')
    ctx.state.answer = answer
    await next()
  }

  async checkAnswerer (ctx, next) {
    const { answer } = ctx.state
    if (answer.answerer.toString() !== ctx.state.user._id) return ctx.throw(403)
    await next()
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
    if (!answer) return ctx.throw(404)
    ctx.body = answer
  }

  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })


    const question = await new Answer({
                                 ...ctx.request.body,
                                 answerer: ctx.state.user._id,
                                 questionId: ctx.params.questionId
                               }).save()
    ctx.body = question
  }

  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false }
    })
    await ctx.state.answer.update(ctx.request.body)
    const answer = await Answer.findById(ctx.state.answer.id)
    ctx.body = answer
  }

  async remove (ctx) {
    await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new AnswersCtrl()