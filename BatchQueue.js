var _ = require('lodash'),
    Q = require('q'),
    timers = require('timers');

function BatchQueue(options) {
  this.queue = [];
  this.running = false;

  this.options = _.merge({
    delay: 1000,
    batchSize: 100
    /*
    callback: null, // call on each batch
    */
  }, options || {});
};
BatchQueue.constructor = BatchQueue;

BatchQueue.prototype.add = function(item) {
  this.queue.push(item);
  if (!this.running) {
    this.start();
  }
};

BatchQueue.prototype.start = function() {
  this.running = true;
  this.scheduleNextBatch();
};

BatchQueue.prototype.stop = function() {
  this.running = false;
};

BatchQueue.prototype.processBatch = function() {
  var delay = this.options.delay,
      batchSize = this.options.batchSize,
      callback = this.options.callback,
      _this = this;

  if (this.queue.length === 0) {
    this.stop(); // stop until more items are added
    return;
  }
  var batch = this.queue.splice(0, batchSize);
  callback(batch)
    .then(function() { // Callback promise fulfilled
      console.log("%d items processed successfully", batch.length);

    }, function(error) { // Callback promise rejected
      console.log(error);
      // return the items to the queue to retry later
      _this.queue = batch.concat( _this.queue );
    })
    .fin(function() {
      // schedule the next batch
      _this.scheduleNextBatch();
    })
    .done();
};

BatchQueue.prototype.scheduleNextBatch = function() {
  var delay = this.options.delay,
      _this = this;
  if (_this.running) {
    Q.delay(delay).then(function() {
      _this.processBatch();
    });
  }
};

module.exports = BatchQueue;