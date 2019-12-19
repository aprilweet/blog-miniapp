const TCB = require("../../utils/tcb.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    target: {
      type: Object,
      observer: function() {
        this.loadComments(false);
      }
    },
    input: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        if (newVal != oldVal)
          this.triggerEvent("input", {
            value: newVal
          }, {});
      }
    },
    placeholder: {
      type: String,
      value: "请输入"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    comments: [],
    all: false,
    total: 0,
    inputValue: "",

    //private
    loading: false,
    page: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBindTap: function() {
      if (this.data.loading || this.data.all)
        return;
      this.loadComments(true);
    },

    onBindBlur: function(evt) {
      let oldVal = this.data.input;
      if (oldVal) {
        this.setData({
          input: false,
          inputValue: evt.detail.value
        });
        this.triggerEvent("input", {
          value: false
        }, {});
      }
    },

    onBindConfirm: function(evt) {
      const _this = this;
      TCB.addComment({
        ...this.properties.target,
        userID: getApp().data.user.userID,
        body: evt.detail.value
      }, {
        success() {
          wx.showToast({
            title: "谢谢",
            icon: "success"
          });
          let oldVal = _this.data.input;
          _this.setData({
            input: false,
            inputValue: ""
          });
          if (oldVal) {
            _this.triggerEvent("input", {
              value: false
            }, {});
          }
          _this.loadComments(false);
        },
        fail() {
          wx.showToast({
            title: "评论失败了\u{1F644}",
            icon: "none"
          });
        },
        complete(res) {
          console.debug("AddComment", res);
        }
      });
    },

    onBindLongPress: function(evt) {
      const comment = evt.currentTarget.dataset.comment;
      let itemList = [];
      if (comment.user.userID == getApp().data.user.userID)
        itemList.push("删除");
      else if (getApp().data.user.admin)
        itemList.push("[管理员]删除");

      if (itemList.length == 0)
        return;

      const _this = this;
      wx.showActionSheet({
        itemList: itemList,
        success(res) {
          switch (res.tapIndex) {
            case 0:
              TCB.deleteComment({
                commentID: comment.commentID
              }, {
                success() {
                  wx.showToast({
                    title: "删除评论成功",
                    icon: "success"
                  });
                  _this.loadComments(false);
                },
                fail() {
                  wx.showToast({
                    title: "删除评论失败了\u{1F644}",
                    icon: "none"
                  });
                },
                complete(res) {
                  console.debug("DeleteComment", res);
                }
              });
              break;
            default:
              console.error("Invalid comment tap index:", res.tapIndex);
          }
        },
        fail(res) {
          console.error(res);
        }
      });
    },

    loadComments: function(more) {
      let page = 1;
      if (more)
        page = this.data.page + 1;

      this.data.loading = true;

      const _this = this;
      TCB.getLatestComments({
        ...this.properties.target,
        page: page,
        pageSize: CONFIG.commentPageSize
      }, {
        success(res) {
          let comments = res.result.data.comments;
          for (let comment of comments)
            comment.createTime = UTIL.printDateTime(comment.createTime);

          if (more)
            comments = _this.data.comments.concat(res.result.data.comments);

          let total = res.result.data.total;
          let all = (comments.length >= total);

          _this.setData({
            comments: comments,
            all: all,
            total: total
          });
          _this.data.page = page;

          if (comments.length > total) {
            console.error("Comments: Local > Server");
            console.error(comments, total);
          }
        },
        fail(res) {
          wx.showToast({
            title: "加载评论失败",
            icon: "none"
          });
        },
        complete(res) {
          console.debug("GetLatestComments", res);
          _this.data.loading = false;
        }
      })
    }
  }
})