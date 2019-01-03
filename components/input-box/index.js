Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: String,
    value: {
      type: String,
      observer: function(newVal) {
        let empty = (newVal.length == 0);
        if (empty != this.data.emptyInput)
          this.setData({
            emptyInput: empty
          });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    emptyInput: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBindInput: function(evt) {
      let empty = (evt.detail.value.length == 0);
      if (empty != this.data.emptyInput)
        this.setData({
          emptyInput: empty
        });
    },

    onBindBlur: function(evt) {
      this.triggerEvent('blur', {
        value: evt.detail.value
      }, {});
    },

    onBindSubmit: function(evt) {
      this.triggerEvent('confirm', {
        value: evt.detail.value.textarea
      }, {});
    }
  }
})