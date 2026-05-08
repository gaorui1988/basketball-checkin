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
    authLoading: false,
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
      console.error('loadData err', err)
      this.setData({ loading: false })
    }
  },

  // 点击头像直接触发微信授权
  async onTapAvatar() {
    if (this.data.isLoggedIn) return
    this.setData({ authLoading: true })
    try {
      const res = await wx.getUserProfile({
        desc: '用于排行榜展示球友信息',
      })
      if (res && res.userInfo) {
        const { nickName, avatarUrl } = res.userInfo
        await api.updateUserProfile({ nickName, avatarUrl })
        this.setData({
          isLoggedIn: true,
          'stats.nickName': nickName,
          'stats.avatarUrl': avatarUrl,
        })
        wx.showToast({ title: '授权成功 🎉', icon: 'success' })
      }
    } catch (err) {
      const errMsg = err.errMsg || err.message || ''
      if (errMsg.includes('fail auth deny') || errMsg.includes('deny')) {
        wx.showToast({ title: '已取消授权', icon: 'none' })
      } else if (errMsg.includes('privacy')) {
        wx.showToast({ title: '请先同意隐私协议', icon: 'none' })
      } else {
        wx.showToast({ title: '授权失败', icon: 'none' })
      }
    }
    this.setData({ authLoading: false })
  },

  onGoDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onGoRank() {
    wx.switchTab({ url: '/pages/rank/rank' })
  },
})
