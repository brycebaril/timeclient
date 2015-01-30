var test = require("tape")

var Timeclient = require("../timeclient")

test("simple", function (t) {
  var client = new Timeclient("http://brycebaril.com")
  client.get(function (err, times, info) {
    // TODO flesh this out
    t.notOk(err)
    t.ok(times)
    t.ok(info)
    t.end()
  })
})
