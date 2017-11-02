var bunyan = require('bunyan');

exports.getLogger = function (appName) {
  var logger = null;
  if (!logger || null === logger) {
    var logger = bunyan.createLogger({
      name    : appName,
      streams : [{
        type   : 'rotating-file',
        path   : 'logs/' + appName + '.log',
        period : '1d', 
        count  : 10 
      }]
    });
  }
  return logger;
};

exports.getProcessingTime = function clock(start) {

  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round((end[0] * 1000) + (end[1] / 1000000));
};