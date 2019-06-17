'use strict'
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const routers = require('./routes')
const { db } = require('./config')
const path = require('path')

mongoose.connect(db, { useNewUrlParser: true }, () => {
  console.log('> db connect')
})
mongoose.connection.on('error', console.error)

app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '/public/uploads'),
      keepExtensions: true
    }
  }
))
app.use(parameter(app))
routers(app)

const PORT = 3001
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))