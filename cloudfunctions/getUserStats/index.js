// 云函数：getUserStats
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 查用户
  const userRes = await db.collection('users').doc(wxContext.OPENID).get()

  if (!userRes.data) {
    return {
      code: 0,
      data: {
        nickName: '',
        avatarUrl: '',
        points: 0,
        totalSignups: 0,
        totalCheckins: 0,
        totalNoShows: 0,
        totalCancels: 0,
        consecutiveCheckins: 0,
      }
    }
  }

  // 如果用户信息不全，从小程序端补充
  const user = userRes.data
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
}
