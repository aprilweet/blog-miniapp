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
    visible: null,
    wxml: null,
    prev: null,
    next: null,
    target: null,
    interact: false,
    control: false
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

  onBindChange: function(evt) {
    const _this = this;
    SERVER.manageArticle({
      articleID: this.articleID,
      visible: evt.detail.value
    }, {
      success(res) {
        _this.setData({
          visible: evt.detail.value
        });
        wx.showToast({
          title: "设置成功",
          icon: "success"
        });
      },
      fail(res) {
        _this.setData({
          visible: _this.data.visible
        });
        wx.showToast({
          title: "设置失败了\u{1F644}",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("ManageArticle", res);
      }
    });
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
      success(res) {
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
          visible: res.data.visible,
          wxml: wxml,
          prev: res.data.prev,
          next: res.data.next,
          interact: !getApp().data.readOnly,
          control: getApp().data.user.admin
        });

        ANALYTICS.report("open_article", {
          "user_id": getApp().data.user.userID,
          "article_id": article.articleID,
          "article_title": article.title
        });
      },
      fail(res) {
        wx.showToast({
          title: "加载文章失败",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("GetArticle", res);
        wx.hideLoading();
      }
    });
  }
})