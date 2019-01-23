const SERVER = require("../../utils/server.js");
const CONFIG = require("../../config.js");
const UTIL = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeline: [],
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
    this.loadTimeline(false);
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
    this.typeFilter = this.getTypeFilter(evt.detail.value, this.data.timeline);
    this.setData({
      type: evt.detail.value,
      filter: this.getFilter(this.typeFilter, this.ratingFilter)
    });
    let shown = this.data.filter.filter(v => v);
    if (shown.length < 5)
      this.loadTimeline(true);
  },

  onRatingChanged: function(evt) {
    this.ratingFilter = this.getRatingFilter(evt.detail.value, this.data.timeline);
    this.setData({
      rating: evt.detail.value,
      filter: this.getFilter(this.typeFilter, this.ratingFilter)
    });
    let shown = this.data.filter.filter(v => v);
    if (shown.length < 5)
      this.loadTimeline(true);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (this.data.loading)
      return;
    this.loadTimeline(false);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.all || this.data.loading)
      return;
    this.loadTimeline(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "豆瓣"
    };
  },

  getTypeFilter: function(type, timeline) {
    return timeline.map(item => (type == "all" || type == item.type));
  },

  getRatingFilter: function(rating, timeline) {
    return timeline.map(item => {
      if (rating == "rated")
        return item.item.rating != null;
      else if (rating == "recommend")
        return item.item.rating >= 4;
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

  loadTimeline: function(more) {
    let page = 1;
    if (more)
      page = this.page + 1;
    else
      wx.showLoading({
        title: "正在加载",
      });

    this.data.loading = true;

    const _this = this;
    SERVER.getTimeline({
      page: page,
      pageSize: CONFIG.timelinePageSize,
    }, {
      success(res) {
        let timeline = res.data.timeline;
        let typeFilter = _this.getTypeFilter(_this.data.type, timeline);
        let ratingFilter = _this.getRatingFilter(_this.data.rating, timeline);
        let filter = _this.getFilter(typeFilter, ratingFilter);

        let shown = filter.filter(v => v);
        if (shown.length == 0) {
          wx.nextTick(() => {
            _this.onReachBottom();
          });
        }

        for (let item of timeline) {
          item.item.date = UTIL.printDate(item.item.date);
          if (item.type == "book")
            item.wxkey = item.item.book.link;
          else if (item.type == "movie")
            item.wxkey = item.item.movie.link;
          else
            console.error("Invalid timeline type:", item.type);
        }

        if (more) {
          timeline = _this.data.timeline.concat(timeline);
          typeFilter = _this.typeFilter.concat(typeFilter);
          ratingFilter = _this.ratingFilter.concat(ratingFilter);
          filter = _this.data.filter.concat(filter);
        }

        let total = res.data.total;
        let all = (timeline.length >= total);

        _this.setData({
          timeline: timeline,
          filter: filter,
          all: all
        });
        _this.page = page;
        _this.typeFilter = typeFilter;
        _this.ratingFilter = ratingFilter;

        if (timeline.length > total) {
          console.error("Timeline: Local > Server");
          console.error(timeline, total);
        }

        if (typeFilter.length != timeline.length) {
          console.error("length: TypeFilter != Timeline");
          console.error(timeline, typeFilter);
        }

        if (ratingFilter.length != timeline.length) {
          console.error("length: RatingFilter != Timeline");
          console.error(timeline, ratingFilter);
        }
      },
      fail(res) {
        wx.showToast({
          title: "加载豆瓣失败",
          icon: "none"
        });
      },
      complete(res) {
        console.debug("GetTimeline", res);
        _this.data.loading = false;

        if (!more) {
          wx.hideLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  }
})