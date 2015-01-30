module.exports = wrapdns

var dns = require("dns")
var EE = require("events").EventEmitter

function wrapdns() {
  var e = new EE()
  var fns = Object.keys(dns).filter(function (key) {
    return typeof dns[key] == "function"
  })
  fns.forEach(function (prop) {
    wrap(e, prop, dns[prop])
  })
  return e
}

function wrap(e, name, fn) {
  dns[name] = function () {
    e.emit("start", name)
    var args = []
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i]
    }
    var cb = args[args.length - 1]
    if (typeof cb == "function") {
      var wrapped = function wrapper() {
        e.emit("done", name)
        cb.apply(this, arguments)
      }
      args[args.length - 1] = wrapped
    }
    fn.apply(this, args)
  }
}
