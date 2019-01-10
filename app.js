App({
  data: {
    device: null,
    version: "1.0.0",
    user: null,
    readOnly: true,
    userUpdated: false
  },

  onLaunch: function() {
    const _this = this;
    wx.getSystemInfo({
      success: function(res) {
        console.info(res);
        _this.data.device = `${res.brand} ${res.model} ${res.system}`;
      }
    });
  }
})