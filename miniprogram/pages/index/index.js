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
    tempAvatarPath: '',  // 临时文件路径
    cloudAvatarUrl: '',  // 上传后的云存储URL
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
    } catch (e) {
      console.warn('checkLogin err', e)
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

  // 弹出授权窗口
  onShowLogin() {
    this.setData({
      showLoginPopup: true,
      tempNickName: '',
      tempAvatarPath: '',
      cloudAvatarUrl: '',
    })
  },

  onClosePopup() {
    this.setData({ showLoginPopup: false })
  },

  // 选择头像（拿到临时路径）
  onChooseAvatar(e) {
    this.setData({ tempAvatarPath: e.detail.avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  // 保存：先上传头像到云存储，再保存到数据库
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
        // 上传到云存储，路径为 avatars/{openid}.png
        const cloudRes = await wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}.png`,
          filePath: tempPath,
        })
        avatarUrl = cloudRes.fileID
      }

      await api.updateUserProfile({ nickName, avatarUrl })
      this.setData({
        isLoggedIn: true,
        showLoginPopup: false,
      })
      wx.showToast({ title: '设置成功 🎉', icon: 'success' })
    } catch (err) {
      console.error('保存失败', err)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
    this.setData({ loginLoading: false })
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
