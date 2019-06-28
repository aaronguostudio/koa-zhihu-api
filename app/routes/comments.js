const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' })
const {
  find, findById, create, update, remove,
  checkCommentExist, checkCommentator
} = require('../controllers/comments')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', auth, checkCommentExist, findById)
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)
router.delete('/:id', auth, checkCommentExist, checkCommentator, remove)

module.exports = router