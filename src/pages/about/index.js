const TCB = require("../../utils/tcb.js");
const UTIL = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    me: null,
    target: {
      target: "system"
    },
    interact: false,
    tc: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    TCB.aboutMe({}, {
      success(res) {
        _this.setData({
          me: res.result.data,
          interact: !getApp().data.readOnly
        });
      },
      fail(res) {
        wx.showToast({
          title: "加载资料失败",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("AboutMe", res);
      }
    });

    this.setData({
      tc: UTIL.getTucaoData()
    });
  },

  onCatchTap: function(evt) {
    let url = evt.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success() {
          wx.showToast({
            title: "链接已复制到剪贴板，请在浏览器中打开",
            icon: "none"
          });
        }
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})