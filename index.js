'use strict'
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const usersRouter = new Router({prefix: '/users'})
const auth = async (ctx, next) => {
  if (ctx.url !== '/users') {
    ctx.throw(401);
  }
  await next()
}

router.get('/', ctx => {
  ctx.body = 'Index'
})

usersRouter.get('/', auth, ctx => {
  ctx.body = 'User Index'
})

usersRouter.post('/', auth, ctx => {
  ctx.body = 'User Post'
})

usersRouter.put('/', auth, ctx => {
  ctx.body = 'User Post'
})

usersRouter.delete('/', auth, ctx => {
  ctx.status = 204
})

usersRouter.get('/:id', auth, ctx => {
  ctx.body = 'User ' + ctx.params.id
})

app.use(router.routes())
app.use(usersRouter.routes())
app.use(usersRouter.allowedMethods()) // not implemented methods will return 405

app.listen(3001)