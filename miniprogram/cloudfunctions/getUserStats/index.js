// 云函数：getUserStats
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const userRes = await db.collection('users').doc(wxContext.OPENID).get()
    const user = userRes.data || {}
    return {
      code: 0,
      data: {
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
        points: user.points || 0,
        totalSignups: user.totalSignups || 0,
        totalCheckins: user.totalCheckins || 0,
        totalNoShows: user.totalNoShows || 0,
        totalCancels: user.totalCancels || 0,
        consecutiveCheckins: user.consecutiveCheckins || 0,
      }
    }
  } catch (e) {
    // 用户不存在
    return {
      code: 0,
      data: {
        nickName: '', avatarUrl: '', points: 0,
        totalSignups: 0, totalCheckins: 0,
        totalNoShows: 0, totalCancels: 0, consecutiveCheckins: 0,
      }
    }
  }
}
