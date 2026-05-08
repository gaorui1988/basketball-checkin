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

  async onGetProfile() {
    this.setData({ profileLoading: true })
    try {
      const res = await wx.getUserProfile({
        desc: '用于排行榜展示球友信息',
      })
      if (res && res.userInfo) {
        const { nickName, avatarUrl } = res.userInfo
        await api.updateUserProfile({ nickName, avatarUrl })
        this.setData({
          'stats.nickName': nickName,
          'stats.avatarUrl': avatarUrl,
          isLoggedIn: true,
        })
        wx.showToast({ title: '授权成功 🎉', icon: 'success' })
      }
    } catch (e) {
      // 用户拒绝
      wx.showToast({ title: '已取消授权', icon: 'none' })
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
