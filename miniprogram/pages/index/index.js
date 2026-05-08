// pages/index/index.js
const api = require('../../utils/api')

Page({
  data: {
    activities: [],
    loading: true,
    tabActive: 'open',
    isLoggedIn: false,
    authLoading: false,
  },

  onLoad() {
    this.loadActivities()
    this.checkLogin()
  },

  onShow() {
    if (!this.data.loading) this.loadActivities()
    this.checkLogin()
  },

  async checkLogin() {
    try {
      const stats = await api.getUserStats()
      this.setData({ isLoggedIn: !!(stats && stats.nickName) })
    } catch (e) {}
  },

  async loadActivities() {
    this.setData({ loading: true })
    try {
      const activities = await api.getActivityList(this.data.tabActive)
      this.setData({ activities, loading: false })
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tabActive: tab }, () => this.loadActivities())
  },

  // 授权
  async onOneKeyAuth() {
    if (this.data.isLoggedIn) return
    this.setData({ authLoading: true })
    try {
      const res = await wx.getUserProfile({
        desc: '用于排行榜展示球友信息',
      })
      if (res && res.userInfo) {
        const { nickName, avatarUrl } = res.userInfo
        await api.updateUserProfile({ nickName, avatarUrl })
        this.setData({ isLoggedIn: true })
        wx.showToast({ title: '授权成功 🎉', icon: 'success' })
      }
    } catch (err) {
      const errMsg = err.errMsg || err.message || ''
      if (errMsg.includes('fail auth deny') || errMsg.includes('deny')) {
        wx.showToast({ title: '已取消授权', icon: 'none' })
      } else {
        wx.showToast({ title: '授权失败', icon: 'none' })
      }
    }
    this.setData({ authLoading: false })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  onShareAppMessage() {
    return { title: '🏀 组一波！快来报名', path: '/pages/index/index' }
  },
})
