// pages/index/index.js
const api = require('../../utils/api')

Page({
  data: {
    activities: [],
    loading: true,
    tabActive: 'open',
    isLoggedIn: false,
    loginLoading: false,
    showLoginPopup: false,
    tempNickName: '',
    tempAvatarUrl: '',
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
      this.setData({ loading: false })
    }
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tabActive: tab }, () => {
      this.loadActivities()
    })
  },

  // 弹出授权窗口
  onShowLogin() {
    this.setData({
      showLoginPopup: true,
      tempAvatarUrl: '',
      tempNickName: '',
    })
  },

  // 选择头像
  onChooseAvatar(e) {
    this.setData({ tempAvatarUrl: e.detail.avatarUrl })
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  // 保存授权
  async onSaveProfile() {
    const nickName = this.data.tempNickName
    const avatarUrl = this.data.tempAvatarUrl
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    this.setData({ loginLoading: true })
    try {
      await api.updateUserProfile({ nickName, avatarUrl })
      this.setData({ isLoggedIn: true, showLoginPopup: false })
      wx.showToast({ title: '授权成功 🎉', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setData({ loginLoading: false })
  },

  onClosePopup() {
    this.setData({ showLoginPopup: false })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  onShareAppMessage() {
    return {
      title: '🏀 组一波！快来报名',
      path: '/pages/index/index',
    }
  },
})
