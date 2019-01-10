const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tc: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      tc: UTIL.getTucaoData()
    });
  },

  onReload: function(evt) {
    wx.reLaunch({
      url: "/pages/blog/index",
    });
  }
})