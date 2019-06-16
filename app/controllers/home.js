class HomeCtrl {
  index (ctx) {
    ctx.body = "Home"
  }
}

module.exports = new HomeCtrl()