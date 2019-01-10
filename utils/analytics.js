const SERVER = require("server.js");

module.exports.report = function(event, data) {
  wx.reportAnalytics(event, data);
  SERVER.reportAnalytics({
    event,
    data
  }, {
    complete: function(res) {
      console.debug("ReportAnalytics", res);
    }
  });
}