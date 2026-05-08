// app.js
App({
  globalData: {
    openid: '',
    userInfo: null,
  },

  onLaunch() {
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true,
    })
  },

  // 全局分享配置
  onShareAppMessage() {
    return {
      title: '🏀 来打球！一起组队',
      path: '/pages/index/index',
    }
  },
})
