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
    tempAvatarPath: '',
    oneKeyMode: false,  // true=一键授权, false=手动设置
  },

  onLoad() {
    this.loadActivities()
    this.checkLogin()
  },

  onShow() {
    if (!this.data.loading) this.loadActivities()
    if (!this.data.showLoginPopup) this.checkLogin()
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

  onShowLogin() {
    this.setData({
      showLoginPopup: true,
      oneKeyMode: false,
      tempNickName: '',
      tempAvatarPath: '',
    })
  },

  onClosePopup() {
    this.setData({ showLoginPopup: false })
  },

  // 一键授权微信信息
  async onOneKeyAuth() {
    this.setData({ loginLoading: true })
    try {
      const res = await wx.getUserProfile({
        desc: '用于排行榜展示球友信息',
      })
      if (res && res.userInfo) {
        const { nickName, avatarUrl } = res.userInfo
        await api.updateUserProfile({ nickName, avatarUrl })
        this.setData({
          isLoggedIn: true,
          showLoginPopup: false,
        })
        wx.showToast({ title: '授权成功 🎉', icon: 'success' })
      }
    } catch (err) {
      const errMsg = err.errMsg || err.message || ''
      if (errMsg.includes('fail auth deny') || errMsg.includes('deny')) {
        // 用户拒绝授权 → 切到手动模式
        this.setData({ oneKeyMode: false })
        wx.showToast({ title: '已取消，可手动设置', icon: 'none' })
      } else if (errMsg.includes('privacy')) {
        // 隐私协议未同意，提示去设置
        wx.showToast({ title: '请先同意隐私协议', icon: 'none' })
      } else {
        // 其他错误，切到手动模式
        this.setData({ oneKeyMode: false })
        wx.showToast({ title: '授权失败，请手动设置', icon: 'none' })
      }
    }
    this.setData({ loginLoading: false })
  },

  // 手动设置：选择头像
  onChooseAvatar(e) {
    this.setData({
      oneKeyMode: true,
      tempAvatarPath: e.detail.avatarUrl,
    })
  },

  // 手动设置：输入昵称
  onNicknameInput(e) {
    this.setData({
      oneKeyMode: true,
      tempNickName: e.detail.value,
    })
  },

  // 保存手动设置
  async onSaveProfile() {
    const nickName = this.data.tempNickName
    const tempPath = this.data.tempAvatarPath
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    this.setData({ loginLoading: true })
    try {
      let avatarUrl = ''
      if (tempPath) {
        const compressRes = await wx.compressImage({ src: tempPath, quality: 80 })
        const cloudRes = await wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}.png`,
          filePath: compressRes.tempFilePath,
        })
        avatarUrl = cloudRes.fileID
      }
      await api.updateUserProfile({ nickName, avatarUrl })
      this.setData({ isLoggedIn: true, showLoginPopup: false })
      wx.showToast({ title: '设置成功 🎉', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
    this.setData({ loginLoading: false })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  onShareAppMessage() {
    return { title: '🏀 组一波！快来报名', path: '/pages/index/index' }
  },
})
