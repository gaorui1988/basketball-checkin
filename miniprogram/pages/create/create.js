// pages/create/create.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    title: '',
    date: '',
    time: '',
    location: '',
    maxPlayers: 10,
    minPlayers: 4,
    submitLoading: false,
  },

  onLoad() {
    // 默认日期为今天
    const today = new Date()
    this.setData({
      date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
      time: '19:00',
    })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onPlayersChange(e) {
    this.setData({ maxPlayers: parseInt(e.detail.value) })
  },
  
  onMinPlayersChange(e) {
    this.setData({ minPlayers: parseInt(e.detail.value) })
  },

  async onSubmit() {
    const { title, date, time, location, maxPlayers, minPlayers } = this.data

    if (!title) return wx.showToast({ title: '请输入活动名称', icon: 'none' })
    if (!location) return wx.showToast({ title: '请输入场地', icon: 'none' })
    if (maxPlayers < minPlayers) return wx.showToast({ title: '最少人数不能大于最多人数', icon: 'none' })

    this.setData({ submitLoading: true })
    try {
      await api.createActivity({
        title, date, time, location, maxPlayers, minPlayers,
      })
      wx.showToast({ title: '创建成功 🎉', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' })
      this.setData({ submitLoading: false })
    }
  },
})
