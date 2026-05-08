// app.js
const api = require('./utils/api')

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

    // 自动登录
    this.doLogin()
  },

  async doLogin() {
    try {
      // 获取用户信息
      const userRes = await wx.getUserProfile({
        desc: '用于展示球友资料',
      })

      // 保存用户信息
      if (userRes && userRes.userInfo) {
        this.globalData.userInfo = userRes.userInfo

        // 同步到云数据库
        await api.updateUserProfile({
          nickName: userRes.userInfo.nickName,
          avatarUrl: userRes.userInfo.avatarUrl,
        })
      }
    } catch (e) {
      // 用户拒绝授权，匿名使用
      console.log('用户未授权')
    }
  },

  // 全局分享配置
  onShareAppMessage() {
    return {
      title: '🏀 来打球！一起组队',
      path: '/pages/index/index',
    }
  },
})
