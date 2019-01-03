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

function factory(api) {
  return function(args, cb) {
    let header = {};
    wx.getStorage({
      key: "Cookie",
      success: function(res) {
        header["Cookie"] = res.data;
      },
      fail: function(res) {

      },
      complete: function() {
        let success = cb.success;
        let success_wrap = function(res) {
          if (res.statusCode != 200)
            cb.fail(res);
          else
            success(res);

          if (res.statusCode == 401)
            wx.reLaunch({
              url: "/pages/index/index?invalid=1"
            });
        };

        cb.success = function(res) {
          let setCookie = res.header["Set-Cookie"];
          if (setCookie)
            wx.setStorage({
              key: "Cookie",
              data: setCookie,
              complete: function() {
                success_wrap(res);
              }
            });
          else
            success_wrap(res);
        };

        wx.request({
          ...REQUEST_COMMON,
          url: SERVER_URL + "/" + api,
          header: header,
          data: args,
          ...cb
        });
      }
    });
  };
}

module.exports = {
  login: factory("Login"),
  register: factory("Register"),
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
  getTimeline: factory("GetTimeline")
};