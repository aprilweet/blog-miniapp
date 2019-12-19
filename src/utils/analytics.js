const TCB = require("./tcb.js");

module.exports.report = function(event, data) {
  wx.reportAnalytics(event, data);
  TCB.reportAnalytics({
    event,
    data
  }, {
    complete(res) {
      console.debug("ReportAnalytics", res);
    }
  });
}