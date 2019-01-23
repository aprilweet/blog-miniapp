const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");
const ANALYTICS = require("../../utils/analytics.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    target: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    liked: false,
    inComment: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLikeLiked: function(evt) {
      this.setData({
        liked: evt.detail.value
      });
    },

    onCommentInput: function(evt) {
      this.setData({
        inComment: evt.detail.value
      });
    },

    onGetUserInfo: function(e) {
      if (e.detail.errMsg.indexOf("ok") != -1) {
        if (!getApp().data.userUpdated) {
          let userInfo = e.detail.userInfo;
          this.updateUser(userInfo);
        }
        if (e.target.id == "like")
          this.like();
        else if (e.target.id == "comment")
          this.comment();
        else
          console.error("Invalid target:", e.target.id);
      } else {
        wx.showToast({
          title: "公开信息哈，请放心授权",
          icon: "none",
          duration: 2000
        });

        ANALYTICS.report("reject_auth", {
          "user_id": getApp().data.user.userID,
          "target": this.properties.target.target,
          "target_id": this.properties.target.targetID
        });
      }
    },

    updateUser: function(userInfo) {
      SERVER.updateUser({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender
      }, {
        success(res) {
          getApp().data.userUpdated = true;
        },
        complete(res) {
          console.debug("UpdateUser", res);
        }
      });
    },

    like: function() {
      let likeList = this.selectComponent("#like-list");
      if (this.data.liked)
        likeList.deleteLike();
      else
        likeList.addLike();
    },

    comment: function() {
      this.setData({
        inComment: true
      });
    }
  }
})