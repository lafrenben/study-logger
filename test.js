var StudyLogger = require('./index.js'),
    Q = require('q');

StudyLogger.initialize('http://127.0.0.1:9250/add', {
  boolTest: true,
  numberTest: 1,
  stringTest: "Blah",
  nestedTest: {a: 1, b: 2}
});

StudyLogger.logEvent({
  type: "event.test",
  sequence: 1
});

StudyLogger.logEvent({
  type: "event.test",
  sequence: 2
});

StudyLogger.logEvent({
  type: "event.test",
  sequence: 3
});

function lotsOfEvents() {
  // wait 3 sec then 500 events
  Q.delay(3000).then(function() {
    for (var i = 0; i < 500; i++) {
      StudyLogger.logEvent({
	type: "event.test",
	sequence: i
      });
    }
  });
}
lotsOfEvents();
