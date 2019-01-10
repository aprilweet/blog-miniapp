const CONFIG = require("../config.js")
const UTIL = require("util.js");

const SERVER_URL = `${CONFIG.host}${CONFIG.url}`;
const REQUEST_COMMON = {
  method: "POST",
  header: {
    "content-type": "application/json"
  },
  dataType: "json",
  responseType: "text"
}

module.exports = {
  updateUser: factory("UpdateUser"),
  aboutMe: factory("AboutMe"),
  getArticle: factory("GetArticle"),
  getLatestArticles: factory("GetLatestArticles"),
  getLatestComments: factory("GetLatestComments"),
  getLatestLikes: factory("GetLatestLikes"),
  addComment: factory("AddComment"),
  modifyComment: factory("ModifyComment"),
  deleteComment: factory("DeleteComment"),
  addLike: factory("AddLike"),
  deleteLike: factory("DeleteLike"),
  getTimeline: factory("GetTimeline"),
  reportAnalytics: factory("ReportAnalytics")
};

let login = factory("Login");

function factory(api) {
  return function(args, cb) {
    let header = {};
    wx.getStorage({
      key: "Cookie",
      success: function(res) {
        header["Cookie"] = res.data;
      },
      fail: function(res) {
        console.error("getStorage Cookie failed");
      },
      complete: function() {
        if (!getApp().data.user && api != "Login") {
          //先Login获取必要全局信息
          let task = {
            api,
            args,
            cb
          };
          _check(task);

        } else {
          let success = function(res) {
            if (res.statusCode == 401) {
              // 防止服务端故障时，持续请求
              if (cb.retry)
                return wx.redirectTo({
                  url: "/pages/error/index",
                });
              else
                cb.retry = true;

              // 封装为后续请求
              let task = {
                api,
                args,
                cb
              };
              if (api == "Login")
                _start(task);
              else
                _check(task);
            } else if (res.statusCode != 200) {
              if (cb.fail)
                cb.fail(res);
            } else {
              if (cb.success)
                cb.success(res);
            }
          };

          let callback = {
            success: function(res) {
              let setCookie = res.header["Set-Cookie"];
              if (setCookie)
                wx.setStorage({
                  key: "Cookie",
                  data: setCookie,
                  complete: function() {
                    success(res);
                  }
                });
              else
                success(res);
            },
            fail: cb.fail,
            complete: cb.complete
          };

          wx.request({
            ...REQUEST_COMMON,
            url: SERVER_URL + "/" + api,
            header: header,
            data: args,
            ...callback
          });
        }
      }
    });
  };
}

function _check(task) {
  wx.checkSession({
    success: function() {
      _login(task);
    },
    fail: function() {
      _start(task);
    }
  });
}

function _start(task) {
  wx.login({
    timeout: CONFIG.networkTimeout,
    success: function(res) {
      _login(task, res.code);
    },
    fail: function(res) {
      if (task.cb.fail)
        task.cb.fail(res);
      if (task.cb.complete)
        task.cb.complete(res);
    },
    complete: function(res) {
      console.debug(res);
    }
  });
}

function _login(task, code) {
  let args = {
    "version": getApp().data.version
  };
  if (code)
    args.code = code;

  let cb = null;
  if (task.api == "Login")
    // 不必重复包装Login请求
    cb = task.cb;
  else
    cb = {
      success: function(res) {
        getApp().data.user = {
          userID: res.data.userID,
          admin: res.data.admin
        };
        getApp().data.readOnly = res.data.readOnly;
        factory(task.api)(task.args, task.cb);
      },
      fail: function(res) {
        if (task.cb.fail)
          task.cb.fail(res);
        if (task.cb.complete)
          task.cb.complete(res);
      },
      complete: function(res) {
        console.debug(res);
      }
    };

  login(args, cb);
}