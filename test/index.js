
var thunk = require('thunkify');
var Histogram = require('..');
var redis = require('redis');
var co = require('co');

var db = redis.createClient();

var histo = new Histogram({
  client: db,
  bins: 5
});

histo.add = thunk(histo.add);
histo.load = thunk(histo.load);

describe('Histogram', function(){
  beforeEach(function(done){
    db.flushdb(done);
  })

  describe('.add(n)', function(){
    it('should bin the value', function(done){
      co(function *(){
        yield histo.add(5);
        yield histo.add(8);
        yield histo.add(10);
        yield histo.add(3);
        yield histo.add(5);
        yield histo.add(2);
        yield histo.add(1);
        yield histo.add(10);
        yield histo.add(9);

        var res = yield histo.load();
        res.min.should.equal(1);
        res.max.should.equal(10);
        res.bins.should.eql([5, 0, 0, 1, 3]);
      })(done);
    })
  })
})