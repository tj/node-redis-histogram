
/**
 * Module dependencies.
 */

var assert = require('assert');

/**
 * Expose `Histogram`.
 */

module.exports = Histogram;

/**
 * Initialize a `Histogram` with the given `opts`:
 *
 * - `client` redis client
 * - `key` redis key ["histogram"]
 * - `bins` number of bins [1000]
 *
 * @param {Object} opts
 * @api public
 */

function Histogram(opts) {
  opts = opts || {};
  assert(opts.client, 'redis .client required');
  this.key = opts.key || 'histogram';
  this.bins = opts.bins || 100;
  this.db = opts.client;
  this.min = Infinity;
  this.max = 0;
}

/**
 * Add value `n` to the histogram with optional callback.
 *
 * TODO: batch increments
 * TODO: use lua commands to implement min/max
 *
 * @param {Number} n
 * @param {Function} [fn]
 * @api public
 */

Histogram.prototype.add = function(n, fn){
  this.min = n < this.min ? n : this.min;
  this.max = n > this.max ? n : this.max;
  var d = this.max - this.min;
  var p = (n - this.min) / d;
  var b = Math.max(0, (this.bins * p | 0) - 1);
  this.db.hincrby(this.key, b, 1, fn);
};

/**
 * Load histogram data and invoke `fn(null, bins)`.
 *
 * @param {Function} fn
 * @api public
 */

Histogram.prototype.load = function(fn){
  var self = this;

  this.db.hgetall(this.key, function(err, res){
    if (err) return fn(err);

    var bins = [];
    for (var i = 0; i < self.bins; i++) {
      bins[i] = ~~res[i];
    }

    fn(null, bins);
  });
};

