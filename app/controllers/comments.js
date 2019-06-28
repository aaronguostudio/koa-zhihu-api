const Comment = require('../models/comments')
const { minPerPage, defaultPerPage } = require('../config')

class CommentsCtrl {
  async find (ctx) {
    const { per_page = defaultPerPage } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, minPerPage)
    const q = new RegExp(ctx.query.q, 'i')
    const { questionId, answerId } = ctx.params

    // 存在的话就是二级评论，可选参数考虑放到 query 里面
    const { rootCommentId } = ctx.query
    ctx.body = await Comment
                      .find({ content: q, answerId, questionId, rootCommentId })
                      .limit(perPage)
                      .skip(page * perPage)
                      .populate('commentator replyTo')
  }

  async checkCommentExist (ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    console.log('>>comment', comment)
    if (!comment) return ctx.throw(404, 'Comment is not exist')
    if (ctx.params.questionId
        && comment.questionId.toString() !== ctx.params.questionId)
        {
          return ctx.throw(404, 'No related comment to this question')
        } 
    if (ctx.params.answerId
      && comment.answerId.toString() !== ctx.params.answerId)
      {
        return ctx.throw(404, 'No related comment to this answer')
      }
    await next()
  }

  async checkCommentator (ctx, next) {
    const { comment } = ctx.state
    if ( comment.commentator.toString() !== ctx.state.user_id )
      return ctx.throw(404, 'Commentator is not exist')
    await next()
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
    if (!comment) return ctx.throw(404)
    ctx.body = comment
  }

  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false }
    })
    const { questionId, answerId } = ctx.params
    const comment = await new Comment({
                                 ...ctx.request.body,
                                 commentator: ctx.state.user._id,
                                 questionId,
                                 answerId
                               }).save()
    ctx.body = comment
  }

  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false }
    })

    // Can only update content
    const { content } = ctx.request.body
    await ctx.state.comment.update({ content })
    const comment = await Comment.findById(ctx.state.comment.id)
    ctx.body = comment
  }

  async remove (ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new CommentsCtrl()