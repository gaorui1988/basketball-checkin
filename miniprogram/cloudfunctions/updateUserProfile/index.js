// 云函数：updateUserProfile - 更新微信用户信息
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { nickName, avatarUrl } = event

  // 检查用户是否存在
  const userRes = await db.collection('users').doc(wxContext.OPENID).get()

  if (userRes.data) {
    await db.collection('users').doc(wxContext.OPENID).update({
      data: { nickName, avatarUrl }
    })
  } else {
    await db.collection('users').add({
      data: {
        _id: wxContext.OPENID,
        openid: wxContext.OPENID,
        nickName,
        avatarUrl,
        points: 0,
        totalSignups: 0,
        totalCheckins: 0,
        totalNoShows: 0,
        totalCancels: 0,
        consecutiveCheckins: 0,
      }
    })
  }

  return { code: 0 }
}
