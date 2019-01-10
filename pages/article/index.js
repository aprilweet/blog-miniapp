const SERVER = require("../../utils/server.js");
const UTIL = require("../../utils/util.js");
const ANALYTICS = require("../../utils/analytics.js");

const Towxml = require('../../towxml/main');
const towxml = new Towxml();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: null,
    wxml: null,
    prev: null,
    next: null,
    target: null,
    interact: false
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.article ? this.data.article.title : "文章"
    };
  },

  loadArticle: function() {
    wx.showLoading({
      title: "正在加载",
    });

    const _this = this;
    SERVER.getArticle({
      articleID: this.articleID,
      abstract: false,
      body: true
    }, {
      success: function(res) {
        let article = res.data.article;
        wx.setNavigationBarTitle({
          title: article.title
        });

        article.createTime = UTIL.printDateTime(article.createTime);

        let wxml = null;
        if (article.body) {
          if (article.bodyFormat == "html" || article.bodyFormat == "markdown") {
            wxml = towxml.toJson(article.body, article.bodyFormat);
            // 真机不支持音乐？
            wxml = towxml.initData(wxml, {
              app: _this
            });
            wxml.theme = "light";
            UTIL.initToWxml(_this);
          }
        }
        _this.setData({
          article: article,
          wxml: wxml,
          prev: res.data.prev,
          next: res.data.next,
          interact: !getApp().data.readOnly
        });

        ANALYTICS.report("open_article", {
          "user_id": getApp().data.user.userID,
          "article_id": article.articleID,
          "article_title": article.title
        });
      },
      fail: function(res) {
        wx.showToast({
          title: "加载文章失败",
          icon: "none"
        });
      },
      complete: function(res) {
        console.debug(res);
        wx.hideLoading();
      }
    });
  }
})