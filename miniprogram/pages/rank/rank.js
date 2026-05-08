// pages/rank/rank.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    rankList: [],
    loading: true,
  },

  onShow() {
    this.loadRank()
  },

  async loadRank() {
    this.setData({ loading: true })
    try {
      const data = await api.getRank()
      const list = (data || []).map((item, index) => ({
        ...item,
        medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`,
        gradeLabel: util.getGradeBadge(item.points).label,
      }))
      this.setData({
        rankList: list,
        loading: false,
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  },
})
