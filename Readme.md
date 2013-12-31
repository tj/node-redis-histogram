
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

## API

### Histogram(options)

  - `client` redis client
  - `key` redis key ["histogram"]
  - `bins` number of bins [1000]

### Histogram#add(value, [fn])

  Bin `value` with optional callback.

### Histogram#load(fn)

  Load histogram bins.

# License

  MIT