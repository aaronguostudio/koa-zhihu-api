const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find, findById, create, update, remove, login, checkOwner,
  listFollowing, listFollowers, follow, unfollow, checkUserExist
} = require('../controllers/users')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', create)
router.post('/login', login)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, remove)
router.get('/:id', findById)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)

module.exports = router;