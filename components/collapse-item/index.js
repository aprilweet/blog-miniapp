Component({
  relations: {
    "../collapse/index": {
      type: "parent"
    }
  },

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    collapsed: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBindTap: function(evt) {
      this.setData({
        collapsed: !this.data.collapsed
      });
      this.triggerEvent("collapsed", {
        item: this,
        value: this.data.collapsed
      }, {
        bubbles: true,
        composed: true
      });
    }
  }
})