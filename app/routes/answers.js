const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const {
  find, findById, create, update, remove,
  checkAnswerExist, checkAnswerer, checkQuestionExist
} = require('../controllers/answers')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, checkQuestionExist, create)
router.get('/:id', auth, checkQuestionExist, checkAnswerExist, findById)
router.patch('/:id', auth, checkQuestionExist, checkAnswerExist, checkAnswerer, update)
router.delete('/:id', auth, checkQuestionExist, checkAnswerExist, checkAnswerer, remove)

module.exports = router