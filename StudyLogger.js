var _ = require('lodash'),
    Q = require('q'),
    moment = require('moment'),
    request = require('superagent'),
    BatchQueue = require('./BatchQueue.js');

var StudyLogger = {

  initialize: function(url, extras, options) {
    var _this = this;
    this.url = url;
    this.defaults = _.merge({
      startDate: moment().format(),
      startTimestamp: +moment()
    }, extras || {});

    if (options && options.debug) {
      this.debugMode = true;
    } else {
      this.debugMode = false;
    }

    this.sendQueue = new BatchQueue({
      delay: 1000,
      batchSize: 100,
      callback: function(batch) {
        var deferred = Q.defer();
        var data = batch;
        request
          .post(_this.url)
          .send(batch)
          .end(function(err, res) {
            if (res.ok) {
              deferred.resolve();
            } else {
              if (_this.debugMode) {
                window.alert("Error sending log events to server!\n" + res.text);
              }
              deferred.reject(res.text);
            }
          });
        return deferred.promise;
      }
    });
  },

  logEvent: function(params) {
    var alwaysInclude = {timestamp: +moment()};
    var event = _.extend({}, this.defaults, alwaysInclude, params);
    if (this.debugMode) {
      console.log( event['type'] );
      console.log( event );
    }
    this.sendQueue.add(event);
  }

};

module.exports = StudyLogger;