class UsersCtrl {
  find (ctx) { ctx.body = "f" }

  findById (ctx) { ctx.body = "fd" }

  create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      hoppy: { type: 'string', required: true },
      age: { type: 'number', required: false }
    })
    ctx.body = "cr"
  }

  update(ctx) { ctx.body = "u" }

  remove(ctx) { ctx.body = "r" }
}

module.exports = new UsersCtrl()