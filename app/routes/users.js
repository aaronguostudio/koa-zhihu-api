const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find, findById, create, update, remove, login, checkOwner,
  listFollowing, listFollowers, follow, unfollow, followTopic,
  unfollowTopic, listFollowingTopics, checkUserExist, listQuestions,
  listLikingAnswers, likeAnswer, unlikeAnswer, listDislikingAnswers,
  dislikeAnswer, undislikeAnswer, listCollectiongAnswers, collectAnswer,
  uncollectAnswer
} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')
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
router.get('/:id/questions', listQuestions)

// liking
router.get('/:id/likingAnswers', listLikingAnswers)
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
router.get('/:id/dislikingAnswers', listDislikingAnswers)
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)

// Collection
router.get('/:id/collectingAnswers', listCollectiongAnswers)
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router