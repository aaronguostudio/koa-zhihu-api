'use strict'
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const app = new Koa()
const routers = require('./routes')

// 手动处理错误信息
// app.use(async (ctx, next) => {
//   try {
//     await next()
//   } catch (err) {
//     ctx.status = 500
//     ctx.status = err.status || err.statusCode || 500
//     ctx.body = {
//       message: err.message
//     }
//   }
// })

app.use(error({
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(bodyparser())
app.use(parameter(app))
routers(app)

const PORT = 3001
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))