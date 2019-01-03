const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

const Towxml = require('../../towxml/main');
const towxml = new Towxml();

Page({
  data: {
    articles: null,
    all: null
  },

  loading: false,
  page: 0,

  onLoad: function() {
    this.loadArticles(false);
  },

  onPullDownRefresh: function() {
    if (this.loading)
      return;
    this.loadArticles(false);
  },

  onReachBottom: function() {
    if (this.data.all || this.loading)
      return;
    this.loadArticles(true);
  },

  loadArticles: function(more) {
    let page = 1;
    if (more)
      page = this.page + 1;

    this.loading = true;

    const _this = this;
    SERVER.getLatestArticles({
      page: page,
      pageSize: CONFIG.articlePageSize,
      abstract: true,
      body: false
    }, {
      success(res) {
        let articles = res.data.data.articles;
        for (let article of articles) {
          article.createTime = UTIL.printDateTime(article.createTime);
          if (article.abstractFormat == "plain")
            article.abstractFormat = "markdown";
          if (article.abstractFormat == "html" || article.abstractFormat == "markdown")
            article.abstract = towxml.toJson(article.abstract, article.abstractFormat);
        }

        if (more)
          articles = _this.data.articles.concat(articles);

        let total = res.data.data.total;
        let all = (articles.length >= total);

        _this.setData({
          articles: articles,
          all: all
        });
        _this.page = page;

        if (articles.length > total) {
          console.error("Articals: Local > Server");
          console.error(articles, total);
        }
      },
      fail(res) {

      },
      complete(res) {
        console.debug(res);
        _this.loading = false;

        if (!more)
          wx.stopPullDownRefresh();
      }
    });
  },

  onBindTap: function(evt) {
    const articleID = evt.currentTarget.dataset.articleId;
    wx.navigateTo({
      url: '/pages/article/index?articleID=' + articleID,
    })
  }
})