App({
  data: {
    device: null,
    version: "1.1.0",
    user: null,
    readOnly: true,
    userUpdated: false
  },

  onLaunch: function() {
    const _this = this;
    wx.getSystemInfo({
      success(res) {
        _this.data.device = `${res.brand} ${res.model} ${res.system}`;
      }
    });
  }
})
