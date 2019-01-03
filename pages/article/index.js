const SERVER = require("../../utils/server.js");
const UTIL = require("../../utils/util.js");

const Towxml = require('../../towxml/main');
const towxml = new Towxml();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: null,
    target: null
  },

  articleID: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.articleID = options.articleID;
    this.loadArticle();
    this.setData({
      target: {
        target: "article",
        targetID: this.articleID
      }
    });
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

  loadArticle: function() {
    wx.showLoading({
      title: "正在加载",
      mask: true
    })

    const _this = this;
    SERVER.getArticle({
      articleID: this.articleID,
      abstract: false,
      body: true
    }, {
      success: function(res) {
        let article = res.data.data.article;
        article.createTime = UTIL.printDateTime(article.createTime);
        if (article.bodyFormat == "html" || article.bodyFormat == "markdown")
          article.body = towxml.toJson(article.body, article.bodyFormat);

        _this.setData({
          article: article
        });
      },
      fail: function(res) {

      },
      complete: function(res) {
        console.debug(res);
        wx.hideLoading();
      }
    });
  }
})