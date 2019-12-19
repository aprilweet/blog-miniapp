module.exports.printDateTime = function(val, seconds = false, simple = false) {
  var first, second;

  if (simple)
    first = "Y/M/D";
  else
    first = "Y年M月D日";

  if (seconds)
    second = "h:m:s";
  else
    second = "h:m";

  return formatTime(val, `${first} ${second}`);
}

module.exports.printDate = function(val, simple = false) {
  if (simple)
    return formatTime(val, "Y/M/D");
  else
    return formatTime(val, "Y年M月D日");
}

/**
 * 时间戳转化为年 月 日 时 分 秒
 * val: Date可解析的时间
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

module.exports.initToWxml = function(page) {
  page["event_bind_tap"] = function(evt) {
    let elem = evt.target.dataset._el;
    if (elem.tag == "navigator") {
      let url = elem.attr.href;
      if (url) {
        wx.setClipboardData({
          data: url,
          success(res) {
            wx.showToast({
              title: "链接已复制到剪贴板，请在浏览器中打开",
              icon: "none"
            });
          }
        });
      }
    }
  };
}

module.exports.getTucaoData = function() {
  let data = null;
  try {
    const res = wx.getSystemInfoSync();
    const version = getApp().data.version;
    data = {
      "os": `${res.brand} ${res.model} ${res.system}`,
      "clientVersion": `${res.version} ${res.SDKVersion} ${version}`,
      "clientInfo": JSON.stringify(res)
    };

  } catch (e) {
    console.error(e);
  }

  return {
    appId: "wx8abaf00ee8c3202e",
    extraData: {
      id: 53232,
      customData: data
    }
  }
}