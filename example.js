
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

var sec = 3000;

var n = sec;

while (n--) {
  histo.add(Math.random() * 100 | 0);
}

histo.load(function(err, data){
  data.forEach(function(n){
    console.log(n);
  });
});