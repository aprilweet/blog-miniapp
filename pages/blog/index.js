const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

const Towxml = require('../../towxml/main');
const towxml = new Towxml();

Page({
  data: {
    articles: [],
    wxml: [],
    all: false,
    loading: false
  },

  page: 0,

  onLoad: function() {
    this.loadArticles(false);
  },

  onPullDownRefresh: function() {
    if (this.data.loading)
      return;
    this.loadArticles(false);
  },

  onReachBottom: function() {
    if (this.data.all || this.data.loading)
      return;
    this.loadArticles(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "文章"
    };
  },

  loadArticles: function(more) {
    let page = 1;
    if (more)
      page = this.page + 1;
    else
      wx.showLoading({
        title: "正在加载",
      });

    this.data.loading = true;

    const _this = this;
    SERVER.getLatestArticles({
      page: page,
      pageSize: CONFIG.articlePageSize,
      abstract: true,
      body: false
    }, {
      success(res) {
        let articles = res.data.articles;
        let wxml = [];
        for (let article of articles) {
          article.createTime = UTIL.printDateTime(article.createTime);

          let tmp = null;
          if (article.abstract) {
            if (article.abstractFormat == "plain")
              article.abstractFormat = "markdown";
            if (article.abstractFormat == "html" || article.abstractFormat == "markdown") {
              tmp = towxml.toJson(article.abstract, article.abstractFormat);
              // 真机不支持音乐？
              tmp = towxml.initData(tmp, {
                app: _this
              });
              tmp.theme = "light";
              UTIL.initToWxml(_this);
            }
          }
          wxml.push(tmp);
        }

        if (more) {
          articles = _this.data.articles.concat(articles);
          wxml = _this.data.wxml.concat(wxml);
        }

        let total = res.data.total;
        let all = (articles.length >= total);

        _this.setData({
          articles: articles,
          wxml: wxml,
          all: all
        });
        _this.page = page;

        if (articles.length > total) {
          console.error("Articals: Local > Server");
          console.error(articles, total);
        }
      },
      fail(res) {
        wx.showToast({
          title: "加载文章列表失败",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("GetLatestArticles", res);
        _this.data.loading = false;

        if (!more) {
          wx.hideLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  }
})