timeclient
=====

[![NPM](https://nodei.co/npm/timeclient.png)](https://nodei.co/npm/timeclient/)

A simple tool for testing and timing typical node.js request client times to servers.

Times from request start to request end with various event lifecycle information.

Work in progress!

```js
var Timeclient = require("timeclient")

var client = new Timeclient("http://brycebaril.com")
client.get(function (err, times, info) {
  if (err) {
    console.log(err)
  }
  client.log("GET", times, info)
})
```

```text
GET http://brycebaril.com: 200 (162.243.238.246) > 33 bytes
scheduled -> 3.7506269999999997
socket -> 4.912687
dns -> 406.389613
connect -> 419.729756
response -> 500.81691500000005
data -> 503.85748900000004
end -> 504.88464300000004
```

API
===

LICENSE
=======

MIT
