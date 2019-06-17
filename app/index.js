'use strict'
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const routers = require('./routes')
const { db } = require('./config')

mongoose.connect(db, { useNewUrlParser: true }, () => {
  console.log('> db connect')
})
mongoose.connection.on('error', console.error)

app.use(error({
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(bodyparser())
app.use(parameter(app))
routers(app)

const PORT = 3001
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))