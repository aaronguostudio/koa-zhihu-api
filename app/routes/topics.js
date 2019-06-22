const Router = require('koa-router')
const router = new Router({ prefix: '/topics' })
const {
  find, findById, create, update, listFollowers,
  checkTopicExist, listQuestions
} = require('../controllers/topics')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', auth, checkTopicExist, findById)
router.patch('/:id', auth, checkTopicExist, update)
router.get('/:id/follows', checkTopicExist, listFollowers)
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router