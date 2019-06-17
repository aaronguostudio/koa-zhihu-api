const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, remove } = require('../controllers/users')

router.get('/', find)

router.post('/', create)

router.put('/:id', update)

router.delete('/:id', remove)

router.get('/:id', findById)

module.exports = router;