'use strict'
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
  console.log('middle 1')
  await next();
  console.log('middle 5')
  ctx.body = 'Hello Zhihu API'
})

app.use(async (ctx, next) => {
  console.log('middle 2')
  await next();
  console.log('middle 4')
})

app.use(async (ctx, next) => {
  console.log('middle 3')
})

app.listen(3000)