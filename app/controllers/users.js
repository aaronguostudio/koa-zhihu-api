class UsersCtrl {
  find (ctx) { ctx.body = "f" }
  findById (ctx) { ctx.body = "fd" }
  create (ctx) { ctx.body = "c" }
  update(ctx) { ctx.body = "u" }
  remove(ctx) { ctx.body = "r" }
}

module.exports = new UsersCtrl()