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

    // 检查隐私协议（基础库3.x会自动弹窗，这里做兼容处理）
    this.checkPrivacy()
  },

  async checkPrivacy() {
    try {
      // 检查微信侧是否有待同意的隐私政策
      if (!wx.getPrivacySetting) return
      const res = await wx.getPrivacySetting({
        success: () => {},
        fail: () => {},
      })
      this.globalData.needPrivacyAuth = res.needAuthorization || false
    } catch (e) {
      // 低版本基础库忽略
    }
  },
})
