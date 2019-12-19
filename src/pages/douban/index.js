const TCB = require("../../utils/tcb.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    douban: [],
    all: false,
    loading: false,
    type: "all",
    rating: "all",
    filter: []
  },

  page: 0,

  typeFilter: [],
  ratingFilter: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadDouban(false);
  },

  onBindLongPress: function(evt) {
    let url = evt.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success(res) {
          wx.showToast({
            title: "链接已复制到剪贴板，请在浏览器中打开",
            icon: "none"
          });
        }
      });
    }
  },

  onTypeChanged: function(evt) {
    this.typeFilter = this.getTypeFilter(evt.detail.value, this.data.douban);
    this.setData({
      type: evt.detail.value,
      filter: this.getFilter(this.typeFilter, this.ratingFilter)
    });
    let shown = this.data.filter.filter(v => v);
    if (shown.length < 5)
      this.loadDouban(true);
  },

  onRatingChanged: function(evt) {
    this.ratingFilter = this.getRatingFilter(evt.detail.value, this.data.douban);
    this.setData({
      rating: evt.detail.value,
      filter: this.getFilter(this.typeFilter, this.ratingFilter)
    });
    let shown = this.data.filter.filter(v => v);
    if (shown.length < 5)
      this.loadDouban(true);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (this.data.loading)
      return;
    this.loadDouban(false);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.all || this.data.loading)
      return;
    this.loadDouban(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "豆瓣"
    };
  },

  getTypeFilter: function(type, douban) {
    return douban.map(item => (type == "all" || type == item.type));
  },

  getRatingFilter: function(rating, douban) {
    return douban.map(item => {
      if (rating == "rated")
        return item.rating != null;
      else if (rating == "recommend")
        return item.rating >= 4;
      else
        return true;
    });
  },

  getFilter: function(typeFilter, ratingFilter) {
    if (typeFilter.length != ratingFilter.length)
      console.error("length: TypeFilter != RatingFilter");

    let filter = typeFilter.map((item, index) => item && ratingFilter[index]);
    return filter;
  },

  loadDouban: function(more) {
    let page = 1;
    if (more)
      page = this.page + 1;
    else
      wx.showLoading({
        title: "正在加载",
      });

    this.data.loading = true;

    const _this = this;
    TCB.getDouban({
      page: page,
      pageSize: CONFIG.doubanPageSize,
    }, {
      success(res) {
        let douban = res.result.data.douban;
        let typeFilter = _this.getTypeFilter(_this.data.type, douban);
        let ratingFilter = _this.getRatingFilter(_this.data.rating, douban);
        let filter = _this.getFilter(typeFilter, ratingFilter);

        let shown = filter.filter(v => v);
        if (shown.length == 0) {
          wx.nextTick(() => {
            _this.onReachBottom();
          });
        }

        for (let item of douban) {
          item.date = UTIL.printDate(item.date);
          if (item.type == "book")
            item.wxkey = item.info.link;
          else if (item.type == "movie")
            item.wxkey = item.info.link;
          else
            console.error("Invalid douban type:", item.type);
        }

        if (more) {
          douban = _this.data.douban.concat(douban);
          typeFilter = _this.typeFilter.concat(typeFilter);
          ratingFilter = _this.ratingFilter.concat(ratingFilter);
          filter = _this.data.filter.concat(filter);
        }

        let total = res.result.data.total;
        let all = (douban.length >= total);

        _this.setData({
          douban: douban,
          filter: filter,
          all: all
        });
        _this.page = page;
        _this.typeFilter = typeFilter;
        _this.ratingFilter = ratingFilter;

        if (douban.length > total) {
          console.error("Douban: Local > Server");
          console.error(douban, total);
        }

        if (typeFilter.length != douban.length) {
          console.error("length: TypeFilter != Douban");
          console.error(douban, typeFilter);
        }

        if (ratingFilter.length != douban.length) {
          console.error("length: RatingFilter != Douban");
          console.error(douban, ratingFilter);
        }
      },
      fail(res) {
        wx.showToast({
          title: "加载豆瓣失败",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("GetDouban", res);
        _this.data.loading = false;

        if (!more) {
          wx.hideLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  }
})