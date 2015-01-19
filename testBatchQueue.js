var Q = require('q'),
    BatchQueue = require('./BatchQueue.js');

var testBatch = 0;
var FAIL_ON = 2;

var testQueue = new BatchQueue({
  batchSize: 2,
  delay: 1000,
  callback: function(batch) {
    var deferred = Q.defer();
    console.log("Got a batch of size %d", batch.length);
    for (var i = 0; i < batch.length; i++) {
      console.log(batch[i]);
    }
    Q.delay(1000).then(function() {
      testBatch += 1;
      if (testBatch !== FAIL_ON) {
	deferred.resolve();
      } else {
	deferred.reject("Something went wrong!");
      }
    });
    return deferred.promise;
  }
});

testQueue.add('A');
testQueue.add('B');
testQueue.add('C');
testQueue.add('D');
testQueue.add('E');

// Test whether it wakes up when new items are added after emptying the queue.
Q.delay(10000).then(function() {
  testQueue.add('F');
  testQueue.add('G');
  testQueue.add('H');
});

// testQueue.stop();