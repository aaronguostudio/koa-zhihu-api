'use strict'
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const usersRouter = new Router({prefix: '/users'})

router.get('/', ctx => {
  ctx.body = 'Index'
})

usersRouter.get('/', ctx => {
  ctx.body = 'User Index'
})

usersRouter.post('/', ctx => {
  ctx.body = 'User Post'
})

usersRouter.get('/:id', ctx => {
  ctx.body = 'User ' + ctx.params.id
})

app.use(router.routes())
app.use(usersRouter.routes())

// custom router
// app.use(async (ctx, next) => {
//   if (ctx.url === '/') {
//     if (ctx.method === 'GET') ctx.body='index#GET'
//     else if (ctx.method === 'POST') ctx.body='index#POST'
//     else ctx.status = 405
//   }
//   else if (ctx.url.match(/\/users\/\w+/)) {
//     const userId = ctx.url.match(/\/users\/(\w+)/)[1];
//     ctx.body = `User ${userId}`
//   }
//   else {
//     ctx.status = 404
//   }
// })

app.listen(3001)