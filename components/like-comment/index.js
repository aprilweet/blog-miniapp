const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

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

    onLikeBindTap: function() {
      let likeList = this.selectComponent("#like-list");
      if (this.data.liked)
        likeList.deleteLike();
      else
        likeList.addLike();
    },

    onCommentBindTap: function() {
      this.setData({
        inComment: true
      });
    },

    onCommentInput: function(evt) {
      this.setData({
        inComment: evt.detail.value
      });
    }
  }
})