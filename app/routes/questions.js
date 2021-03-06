const Router = require('koa-router')
const router = new Router({ prefix: '/questions' })
const {
  find, findById, create, update, remove, checkQuestionExist, checkQuestioner
} = require('../controllers/questions')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', auth, checkQuestionExist, findById)
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, remove)

module.exports = router