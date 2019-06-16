'use strict'
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const app = new Koa()
const routers = require('./routes')

app.use(bodyparser())
routers(app)

const PORT = 3001
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))