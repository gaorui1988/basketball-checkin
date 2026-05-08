// pages/detail/detail.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activity: null,
    signups: [],
    loading: true,
    mySignup: null,
    isCreator: false,
    badge: null,
    actionLoading: false,
    statusText: '',
    displayDate: '',
    weekday: '',
  },

  onLoad(options) {
    this.activityId = options.id
    this.loadDetail()
  },

  onShow() {
    if (this.activityId && !this.data.loading) {
      this.loadDetail()
    }
  },

  async loadDetail() {
    this.setData({ loading: true })
    try {
      const data = await api.getActivityDetail(this.activityId)
      const act = data.activity
      
      this.setData({
        activity: act,
        signups: data.signups.map(s => ({
          ...s,
          displayStatus: util.getSignupStatusText(s.status),
        })),
        mySignup: data.mySignup,
        isCreator: data.isCreator,
        loading: false,
        badge: util.getGradeBadge(data.myStats?.points || 0),
        statusText: act.status === 'open' ? '报名中' : act.status === 'playing' ? '进行中' : '已结束',
        displayDate: util.formatDate(act.date),
        weekday: util.formatWeekday(act.date),
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
            wx.showToast({ title: '已取消，-5积分', icon: 'success' })
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
      wx.showToast({ title: '签到成功 ✅', icon: 'success' })
      this.loadDetail()
    } catch (err) {
      wx.showToast({ title: err.errMsg || '签到失败', icon: 'none' })
    }
    this.setData({ actionLoading: false })
  },

  async onMarkNoShow(e) {
    const openid = e.currentTarget.dataset.openid
    wx.showModal({
      title: '确认放鸽子？',
      content: '标记后将扣除20积分',
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
      title: `🏀 ${act?.title || '组一波！'}`,
      path: `/pages/detail/detail?id=${this.activityId}`,
    }
  },
})
