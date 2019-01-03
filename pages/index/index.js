const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.invalid)
      this.login();
    else
      this.start();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  start: function() {
    const _this = this;
    wx.checkSession({
      success: _this.register,
      fail: function() {
        _this.login();
      }
    });
  },

  login: function() {
    const _this = this;
    wx.showLoading({
      title: "正在登录微信",
    });
    wx.login({
      timeout: CONFIG.networkTimeout,
      success: function(res) {
        wx.showLoading({
          title: "正在登录",
        });
        SERVER.login({
          code: res.code
        }, {
          success: function(res) {
            _this.register();
          },
          fail: function(res) {
            wx.hideLoading();
            wx.showToast({
              title: "登录失败",
            });
          },
          complete: function(res) {
            console.debug(res);
          }
        })
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: "登录微信失败",
        });
      },
      complete: function(res) {
        console.debug(res);
      }
    });
  },

  register: function() {
    const _this = this;
    wx.showLoading({
      title: "正在获取用户信息",
    });
    wx.getUserInfo({
      success: function(res) {
        wx.showLoading({
          title: "正在注册",
        });

        let userInfo = res.userInfo;
        SERVER.register({
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender
        }, {
          success: function(res) {
            getApp().data.user = {
              userID: res.data.data.userID,
              admin: res.data.data.admin
            };
            wx.hideLoading();
            wx.showToast({
              title: "注册成功",
            });
            wx.switchTab({
              url: "/pages/blog/index"
            });
          },
          fail: function(res) {
            wx.hideLoading();
            wx.showToast({
              title: "注册失败",
            });
          },
          complete: function(res) {
            console.debug(res);
          }
        });
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: "获取用户信息失败",
        });
      },
      complete: function(res) {
        console.debug(res);
      }
    });
  }
})