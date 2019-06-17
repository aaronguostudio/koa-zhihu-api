const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, remove, login, checkOwner } = require('../controllers/users')
const jwt = require('koa-jwt')
const { secret } = require('../config')

// const auth = async (ctx, next) => {
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace('Bearer ', '')
//   try {
//     const user = jwt.verify(token, secret)
//     ctx.state.user = user;
//   } catch (err) {
//     console.log('>>err', err)
//     ctx.throw(401, err.message)
//   }
//   await next()
// }

const auth = jwt({ secret })

router.get('/', find)

router.post('/', create)

router.post('/login', login)

router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, remove)

router.get('/:id', findById)

module.exports = router;