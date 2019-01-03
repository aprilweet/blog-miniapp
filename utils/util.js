module.exports.printDateTime = function(stamp, simple = false) {
  if (simple)
    return formatTime(stamp * 1000, "Y/M/D h:m:s");
  else
    return formatTime(stamp * 1000, "Y年M月D日 h:m:s");
}

module.exports.printDate = function(stamp, simple = false) {
  if (simple)
    return formatTime(stamp * 1000, "Y/M/D");
  else
    return formatTime(stamp * 1000, "Y年M月D日");
}

module.exports.parseUrl = function(url) {
  var obj = {};
  var mark = url.indexOf("?");
  if (mark == -1) {
    obj.url = url;
  } else {
    obj.url = url.substring(0, mark);
    var paraString = url.substring(mark + 1, url.length).split("&");
    for (var i in paraString) {
      let keyvalue = paraString[i].split("=");
      let key = keyvalue[0];
      let value = keyvalue[1];
      obj.params[key] = value;
    }
  }
  return obj;
}

/**
 * 时间戳转化为年 月 日 时 分 秒
 * val: 传入时间戳，单位毫秒
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
 */
function formatTime(val, format) {
  function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(val);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}