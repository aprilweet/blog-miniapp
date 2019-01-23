const SERVER = require("server.js");

module.exports.report = function(event, data) {
  wx.reportAnalytics(event, data);
  SERVER.reportAnalytics({
    event,
    data
  }, {
    complete(res) {
      console.debug("ReportAnalytics", res);
    }
  });
}