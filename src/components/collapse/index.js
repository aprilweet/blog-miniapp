Component({
  relations: {
    "../collapse-item/index": {
      type: "child"
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    accordion: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    onBindCollapsed: function(evt) {
      if (!this.properties.accordion)
        return;
      const nodes = this.getRelationNodes("../collapse-item/index");
      nodes.forEach(node => {
        if (!Object.is(node, evt.detail.item))
          node.setData({
            collapsed: true
          });
      });
    }
  }
})