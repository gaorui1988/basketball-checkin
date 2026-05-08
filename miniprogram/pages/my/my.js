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
    tempAvatarUrl: '',
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
      console.error(err)
      this.setData({ loading: false })
    }
  },

  // 弹出授权
  onShowLogin() {
    this.setData({
      showLoginPopup: true,
      tempAvatarUrl: '',
      tempNickName: '',
    })
  },

  onChooseAvatar(e) {
    this.setData({ tempAvatarUrl: e.detail.avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  async onSaveProfile() {
    const nickName = this.data.tempNickName
    const avatarUrl = this.data.tempAvatarUrl
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    this.setData({ profileLoading: true })
    try {
      await api.updateUserProfile({ nickName, avatarUrl })
      this.setData({
        isLoggedIn: true,
        showLoginPopup: false,
        'stats.nickName': nickName,
        'stats.avatarUrl': avatarUrl,
      })
      wx.showToast({ title: '授权成功 🎉', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setData({ profileLoading: false })
  },

  onClosePopup() {
    this.setData({ showLoginPopup: false })
  },

  onGoDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onGoRank() {
    wx.switchTab({ url: '/pages/rank/rank' })
  },
})
