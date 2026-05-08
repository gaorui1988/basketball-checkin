// pages/index/index.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activities: [],
    loading: true,
    tabActive: 'open',  // open | my | past
    myActivities: [],
  },

  onLoad() {
    this.loadActivities()
  },

  onShow() {
    // 返回时刷新
    if (!this.data.loading) {
      this.loadActivities()
    }
  },

  async loadActivities() {
    this.setData({ loading: true })
    try {
      const activities = await api.getActivityList(this.data.tabActive)
      this.setData({ activities, loading: false })
    } catch (err) {
      console.error('加载活动失败', err)
      this.setData({ loading: false })
    }
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tabActive: tab }, () => {
      this.loadActivities()
    })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  // 分享给微信群
  onShareAppMessage() {
    return {
      title: '🏀 来打球！看看最近有什么活动',
      path: '/pages/index/index',
    }
  },
})
