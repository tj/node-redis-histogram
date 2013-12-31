
/**
 * Module dependencies.
 */

var Histogram = require('./');
var redis = require('redis');

var histo = new Histogram({
  client: redis.createClient(),
  bins: 10
})

histo.db.flushdb()

setTimeout(function(){
  var n = 3000;

  while (n--) {
    histo.add(Math.random() * 100 | 0);
  }

  histo.load(function(err, data){
    if (err) throw err;
    data.forEach(function(n){
      console.log(n);
    });
  });
}, 500);