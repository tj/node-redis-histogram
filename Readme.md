
# redis-histogram

  Redis histogram for node.js

## Installation

```
$ npm install redis-histogram
```

## Example

```js
var Histogram = require('..');
var redis = require('redis');

var hist = new Histogram({
  client: redis.createClient(),
  bins: 10
});

var n = 1000;

while (n--) {
  hist.add(Math.random() * 50 | 0);
}

hist.load(function(err, bins){
  console.log(bins)
});
```

# License

  MIT