// pages/rank/rank.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    rankList: [],
    loading: true,
    tabActive: 'points',  // points | attendance
  },

  onShow() {
    this.loadRank()
  },

  async loadRank() {
    this.setData({ loading: true })
    try {
      const data = await api.getRank()
      this.setData({
        rankList: data || [],
        loading: false,
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tabActive: tab }, () => this.loadRank())
  },

  getMedal(index) {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  },
})
