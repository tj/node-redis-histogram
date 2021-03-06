
/**
 * Module dependencies.
 */

var assert = require('assert');
var fs = require('fs');

// lua script

var script = fs.readFileSync(__dirname + '/bin.lua', 'utf8');
var hash;

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
 * - `ttl` expirey in milliseconds [1 hour]
 *
 * @param {Object} opts
 * @api public
 */

function Histogram(opts) {
  opts = opts || {};
  assert(opts.client, 'redis .client required');
  this.key = opts.key || 'histogram';
  this.bins = opts.bins || 100;
  this.ttl = null == opts.ttl ? 3600000 : opts.ttl;
  this.db = opts.client;
  if (!hash) this.loadScript();
}

/**
 * Execute SCRIPT LOAD with binning script.
 *
 * @api private
 */

Histogram.prototype.loadScript = function(){
  var self = this;
  this.db.send_command('SCRIPT', ['LOAD', script], function(err, res){
    if (err) throw err;
    hash = res;
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
  if (!hash) return; // TODO: queue
  this.db.evalsha(hash, 1, this.key, this.bins, this.ttl, n, fn);
};

/**
 * Load histogram data and invoke `fn(null, bins)`.
 *
 * @param {Function} fn
 * @api public
 */

Histogram.prototype.load = function(fn){
  var self = this;

  this.db
  .multi()
  .hgetall(this.key + ':aux')
  .hgetall(this.key)
  .exec(function(err, res){
    if (err) return fn(err);

    var aux = res[0];
    var data = res[1];

    var bins = [];
    for (var i = 0; i < self.bins; i++) {
      bins[i] = ~~data[i];
    }

    fn(null, {
      min: ~~aux.min,
      max: ~~aux.max,
      bins: bins
    });
  });
};

