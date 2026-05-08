// components/activity-card/activity-card.js
const util = require('../../utils/util')

Component({
  properties: {
    activity: { type: Object, value: {} }
  },
  observers: {
    'activity'(act) {
      if (!act || !act.date) return
      this.setData({
        statusText: act.status === 'open' ? '报名中' : act.status === 'playing' ? '进行中' : '已结束',
        displayDate: util.formatDate(act.date),
        weekday: util.formatWeekday(act.date),
        progressPercent: Math.min((act.signedCount || 0) / (act.maxPlayers || 10) * 100, 100),
      })
    }
  },
  data: {
    statusText: '',
    displayDate: '',
    weekday: '',
    progressPercent: 0,
  },
  methods: {
    onTap() {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.properties.activity._id}`
      })
    }
  }
})
