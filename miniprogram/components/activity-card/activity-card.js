// components/activity-card/activity-card.js
Component({
  properties: {
    activity: { type: Object, value: {} }
  },
  methods: {
    onTap() {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.properties.activity._id}`
      })
    }
  }
})
