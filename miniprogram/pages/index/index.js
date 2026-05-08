// pages/index/index.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activities: [],
    loading: true,
    tabActive: 'open',
    isLoggedIn: false,
    loginLoading: false,
  },

  onLoad() {
    this.loadActivities()
    this.checkLogin()
  },

  onShow() {
    if (!this.data.loading) {
      this.loadActivities()
      this.checkLogin()
    }
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

  async onLogin() {
    this.setData({ loginLoading: true })
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
    } catch (e) {
      // 用户拒绝
    }
    this.setData({ loginLoading: false })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  onShareAppMessage() {
    return {
      title: '🏀 来打球！看看最近有什么活动',
      path: '/pages/index/index',
    }
  },
})
