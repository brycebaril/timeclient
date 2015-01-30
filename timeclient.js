module.exports = TimeClient

var http = require("http")
var https = require("https")
var xtend = require("xtend")
var url = require("url")
var dnsEvents = require("./wrapdns")()

http.globalAgent.maxSockets = Infinity
https.globalAgent.maxSockets = Infinity

var REQ_TIMEOUT = 60000 // one minute

function TimeClient(uri) {
  if (!(this instanceof TimeClient)) {
    return new TimeClient(uri)
  }
  if (uri == null) {
    throw new TypeError("url cannot be null/undefined")
  }
  this.url = uri
  this.options = url.parse(uri)
}

TimeClient.prototype.get = function get(callback) {
  var opts = xtend(this.options, {method: "GET", headers: {}})
  this._fetch(opts, null, callback)
}

TimeClient.prototype.post = function post(body, callback) {
  var opts = xtend(this.options, {method: "POST", headers: {}})
  if (body != null) {
    options.headers["Content-Length"] = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body)
  }
  this._fetch(opts, body, callback)
}
TimeClient.prototype.put = function put(body, callback) {
  var opts = xtend(this.options, {method: "POST", headers: {}})
  if (body != null) {
    options.headers["Content-Length"] = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body)
  }
  this._fetch(opts, body, callback)
}
// TODO DEL, etc

TimeClient.prototype.log = function log(method, times, info) {
  info = xtend({statusCode: "??", remoteAddress: "??", bodyLength: "??"}, info)
  console.log("%s %s: %s (%s) > %s bytes", method, this.url, info.statusCode, info.remoteAddress, info.bodyLength)

  logTimes(times)
}

function logTimes(times, unit) {
  if (times == null) {
    return console.log("¯\\_(ツ)_/¯")
  }
  if (unit == null) {
    unit = "ms"
  }
  var factor = (unit == "ms") ? 1000 : 1
  var keys = Object.keys(times).filter(function (key) {
    return times[key] != null
  })
  var t = {}
  keys.forEach(function (key) {
    t[key] = hrToS(times[key]) * factor
  })
  var sorted = keys.sort(function (a, b) {
    return t[a] - t[b]
  })
  sorted.forEach(function (key) {
    console.log("%s -> %s", key, t[key])
  })
}

function hrToS(hrtime) {
  return hrtime[0] + hrtime[1] / 1e9
}

TimeClient.prototype._fetch = function _fetch(options, body, callback) {
  var self = this
  if (callback == null) {
    if (typeof body == "function") {
      callback = body
      body = null
    }
    else {
      callback = function log(err, times, info) {
        if (err) {
          console.error(err)
        }
        self.log(options.method, times, info)
      }
    }
  }

  var info = {
    statusCode: null,
    remoteAddress: null,
    bodyLength: null
  }

  var times = {
    response: null,
    data: null,
    end: null,
    timeout: null,
    error: null,
    socket: null,
    scheduled: null,
    connect: null,
    //dnsStart: null,
    dns: null
  }

  // dnsEvents.once("start", function dnsStart() {
  //   times.dnsStart = process.hrtime(startTime)
  // })
  dnsEvents.once("done", function dnsStart() {
    times.dns = process.hrtime(startTime)
  })

  var client = (options.protocol === "https:") ? https : http
  // TODO custom headers, cookies

  var startTime = process.hrtime()
  var req = client.request(options, function onResponse(res) {
    times.response = process.hrtime(startTime)
    info.bodyLength = 0
    var firstChunk = true

    info.statusCode = res.statusCode

    res.on("data", function (chunk) {
      if (firstChunk) {
        firstChunk = false
        times.data = process.hrtime(startTime)
      }
      info.bodyLength += chunk.length
    })

    res.on("end", function () {
      times.end = process.hrtime(startTime)
      return callback(null, times, info)
    })
  })

  req.setTimeout(REQ_TIMEOUT)
  req.on("timeout", function () {
    times.timeout = process.hrtime(startTime)
    return callback(new Error("timeout"), times, info)
  })
  req.on("error", function (err) {
    times.error = process.hrtime(startTime)
    return callback(err, times, info)
  })
  req.on("socket", function (sock) {
    times.socket = process.hrtime(startTime)
    var s = sock.socket || sock
    s.on("connect", function () {
      times.connect = process.hrtime(startTime)
      info.remoteAddress = s.remoteAddress
    })
  })

  if (body != null) {
    req.write(body)
  }
  req.end()
  times.scheduled = process.hrtime(startTime)
}
