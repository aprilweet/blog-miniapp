const CONFIG = require("../config.js");

wx.cloud.init({
  env: CONFIG.tcbEnv,
  traceUser: true
})

module.exports = {
  updateUser: factory("UpdateUser"),
  aboutMe: factory("AboutMe"),
  getArticle: factory("GetArticle"),
  getLatestArticles: factory("GetLatestArticles"),
  getLatestComments: factory("GetLatestComments"),
  getLatestLikes: factory("GetLatestLikes"),
  modifyArticle: factory("ModifyArticle"),
  addComment: factory("AddComment"),
  deleteComment: factory("DeleteComment"),
  addLike: factory("AddLike"),
  deleteLike: factory("DeleteLike"),
  getDouban: factory("GetDouban"),
  reportAnalytics: factory("ReportAnalytics"),
  updateAvatar: updateAvatar
}

let login = factory("Login");

function factory(api) {
  return function(args, cb) {
    if (!cb)
      cb = {}

    if (!getApp().data.user && api != "Login") {
      //先Login获取必要全局信息
      let task = {
        api,
        args,
        cb
      }
      _login(task);
    } else {
      let callback = {
        success: function(res) {
          if (res.result.code == -3) {
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
            _login(task);
          } else if (res.result.code != 0) {
            if (cb.fail)
              cb.fail(res)
          } else {
            if (cb.success)
              cb.success(res)
          }
        },
        fail: cb.fail,
        complete: cb.complete
      }

      wx.cloud.callFunction({
        name: "mmApi",
        data: {
          api,
          args
        },
        ...callback
      })
    }
  }
}

function _login(task) {
  let args = {
    "version": getApp().data.version
  };

  let cb = null;
  if (task.api == "Login")
    // 不必重复包装Login请求
    cb = task.cb;
  else
    cb = {
      success(res) {
        getApp().data.user = res.result.data.user;
        getApp().data.readOnly = res.result.data.readOnly;
        factory(task.api)(task.args, task.cb);
      },
      fail(res) {
        if (task.cb.fail)
          task.cb.fail(res);
        if (task.cb.complete)
          task.cb.complete(res);
      },
      complete(res) {
        console.debug("Login", res);
      }
    };

  login(args, cb);
}

function updateAvatar(url, cb) {
  wx.downloadFile({
    url,
    success: function(res) {
      if (res.statusCode === 200) {
        wx.cloud.uploadFile({
          cloudPath: CONFIG.avatarPath + getApp().data.user.userID,
          filePath: res.tempFilePath,
          success: function(res) {
            if (cb.success)
              cb.success(res.fileID);
          },
          fail: function(res) {
            if (cb.fail)
              cb.fail("wx.cloud.uploadFile");
          },
          complete: function(res) {
            console.debug("wx.cloud.uploadFile", res);
          }
        })
      } else {
        if (cb.fail)
          cb.fail("wx.cloud.uploadFile");
      }
    },
    fail: function(res) {
      if (cb.fail)
        cb.fail("wx.downloadFile");
    },
    complete: function(res) {
      console.debug("wx.downloadFile", res);
      if (cb.complete)
        cb.complete();
    }
  });
}