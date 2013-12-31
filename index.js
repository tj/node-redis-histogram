
/**
 * Module dependencies.
 */

var assert = require('assert');
var fs = require('fs');

// lua script

var script = fs.readFileSync('bin.lua', 'utf8');

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
  this.loadScript();
}

/**
 * Execute SCRIPT LOAD with binning script.
 *
 * @api private
 */

Histogram.prototype.loadScript = function(){
  var self = this;
  this.db.send_command('SCRIPT', ['LOAD', script], function(err, hash){
    if (err) throw err;
    self.hash = hash;
  });
};

/**
 * Add value `n` to the histogram with optional callback.
 *
 * TODO: batching of values
 *
 * @param {Number} n
 * @param {Function} [fn]
 * @api public
 */

Histogram.prototype.add = function(n, fn){
  if (!this.hash) return; // TODO: queue
  this.db.evalsha(this.hash, 1, this.key, this.bins, n, fn);
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
    if (!res) return fn();

    var bins = [];
    for (var i = 0; i < self.bins; i++) {
      bins[i] = ~~res[i];
    }

    fn(null, bins);
  });
};

