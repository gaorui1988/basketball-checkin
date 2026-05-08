// pages/detail/detail.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activity: null,
    signups: [],
    loading: true,
    mySignup: null,       // 我当前的报名记录
    isCreator: false,
    badge: null,
    actionLoading: false,
  },

  onLoad(options) {
    this.activityId = options.id
    this.loadDetail()
  },

  async loadDetail() {
    this.setData({ loading: true })
    try {
      const data = await api.getActivityDetail(this.activityId)
      this.setData({
        activity: data.activity,
        signups: data.signups,
        mySignup: data.mySignup,
        isCreator: data.isCreator,
        loading: false,
        badge: util.getGradeBadge(data.myStats?.points || 0),
      })
    } catch (err) {
      console.error(err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  async onSignup() {
    this.setData({ actionLoading: true })
    try {
      await api.signup(this.activityId)
      wx.showToast({ title: '报名成功 🏀', icon: 'success' })
      this.loadDetail()
    } catch (err) {
      wx.showToast({ title: err.errMsg || '报名失败', icon: 'none' })
    }
    this.setData({ actionLoading: false })
  },

  async onCancel() {
    wx.showModal({
      title: '确认取消？',
      content: '取消报名会扣除5积分，确认吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ actionLoading: true })
          try {
            await api.cancelSignup(this.activityId)
            wx.showToast({ title: '已取消', icon: 'success' })
            this.loadDetail()
          } catch (err) {
            wx.showToast({ title: err.errMsg || '取消失败', icon: 'none' })
          }
          this.setData({ actionLoading: false })
        }
      }
    })
  },

  async onCheckin() {
    this.setData({ actionLoading: true })
    try {
      await api.checkin(this.activityId)
      wx.showToast({ title: '签到成功 ✅ +10积分', icon: 'success' })
      this.loadDetail()
    } catch (err) {
      wx.showToast({ title: err.errMsg || '签到失败', icon: 'none' })
    }
    this.setData({ actionLoading: false })
  },

  // 发起人：标记某人放鸽子
  async onMarkNoShow(e) {
    const openid = e.currentTarget.dataset.openid
    wx.showModal({
      title: '确认放鸽子？',
      content: '标记后此人将扣除20积分',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ actionLoading: true })
          try {
            await api.settleActivity(this.activityId, [openid])
            wx.showToast({ title: '已标记', icon: 'success' })
            this.loadDetail()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
          this.setData({ actionLoading: false })
        }
      }
    })
  },

  onShareAppMessage() {
    const act = this.data.activity
    return {
      title: `🏀 ${act?.title || '来打球！'}`,
      path: `/pages/detail/detail?id=${this.activityId}`,
    }
  },
})
