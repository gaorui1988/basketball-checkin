// pages/my/my.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    stats: null,
    myActivities: [],
    badge: null,
    loading: true,
    isLoggedIn: false,
    profileLoading: false,
    showLoginPopup: false,
    tempNickName: '',
    tempAvatarPath: '',
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const [stats, myActivities] = await Promise.all([
        api.getUserStats(),
        api.getMyActivities(),
      ])
      const isLoggedIn = !!(stats && stats.nickName)
      const formattedActivities = (myActivities || []).map(a => ({
        ...a,
        displayStatus: util.getSignupStatusText(a.status),
      }))
      this.setData({
        stats,
        myActivities: formattedActivities,
        loading: false,
        badge: util.getGradeBadge(stats?.points || 0),
        isLoggedIn,
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  onShowLogin() {
    if (this.data.isLoggedIn) return
    this.setData({
      showLoginPopup: true,
      tempNickName: '',
      tempAvatarPath: '',
    })
  },

  onClosePopup() {
    this.setData({ showLoginPopup: false })
  },

  // 一键授权微信信息
  async onOneKeyAuth() {
    this.setData({ profileLoading: true })
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
          'stats.nickName': nickName,
          'stats.avatarUrl': avatarUrl,
        })
        wx.showToast({ title: '授权成功 🎉', icon: 'success' })
      }
    } catch (err) {
      const errMsg = err.errMsg || err.message || ''
      if (errMsg.includes('fail auth deny') || errMsg.includes('deny')) {
        wx.showToast({ title: '已取消', icon: 'none' })
      } else {
        wx.showToast({ title: '授权失败，可手动设置', icon: 'none' })
      }
    }
    this.setData({ profileLoading: false })
  },

  onChooseAvatar(e) {
    this.setData({ tempAvatarPath: e.detail.avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  async onSaveProfile() {
    const nickName = this.data.tempNickName
    const tempPath = this.data.tempAvatarPath
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    this.setData({ profileLoading: true })
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
      this.setData({
        isLoggedIn: true,
        showLoginPopup: false,
        'stats.nickName': nickName,
        'stats.avatarUrl': avatarUrl,
      })
      wx.showToast({ title: '设置成功 🎉', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
    this.setData({ profileLoading: false })
  },

  onGoDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onGoRank() {
    wx.switchTab({ url: '/pages/rank/rank' })
  },
})
