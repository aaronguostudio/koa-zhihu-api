const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find, findById, create, update, remove, login, checkOwner,
  listFollowing, listFollowers, follow, unfollow, followTopic,
  unfollowTopic, listFollowingTopics, checkUserExist
} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')
const jwt = require('koa-jwt')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.post('/login', login)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, remove)
router.get('/:id', findById)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)
router.get('/:id/followingTopics', listFollowingTopics)
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)

module.exports = router