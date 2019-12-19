const TCB = require("../../utils/tcb.js");
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
        const info = this.getUserUpdated(e.detail.userInfo);
        if (info)
          this.updateUser(info);

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
          "user_id_tcb": getApp().data.user.userID,
          "target": this.properties.target.target,
          "target_id_tcb": this.properties.target.targetID
        });
      }
    },

    updateUser: function(userInfo) {
      const api = function(data) {
        TCB.updateUser(data, {
          success(res) {
            Object.assign(getApp().data.user, data);
          },
          complete(res) {
            console.debug("UpdateUser", res);
          }
        });
      };

      if (userInfo.avatar)
        TCB.updateAvatar(
          userInfo.avatar.url, {
            success: function(fileID) {
              userInfo.avatar.fileID = fileID;
              api(userInfo);
            },
            fail: function(stage) {
              console.error("UpdateAvatar", stage);
            }
          }
        );
      else
        api(userInfo);
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
    },

    getUserUpdated: function(info) {
      let ret = {};

      if (info.nickName != getApp().data.user.nickName)
        ret.nickName = info.nickName;
      const gender = this.getGender(info.gender);
      if (gender != getApp().data.user.gender)
        ret.gender = gender;
      if (info.avatarUrl != getApp().data.user.avatar.url)
        ret.avatar = {
          url: info.avatarUrl
        };

      return (Object.keys(ret).length == 0) ? null : ret;
    },

    getGender: function(gender) {
      if (gender == 1)
        return "male"
      else if (gender == 2)
        return "female"
      else
        return "unknown"
    }
  }
})