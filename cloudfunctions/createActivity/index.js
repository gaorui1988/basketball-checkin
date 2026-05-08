// 云函数：createActivity
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, date, time, location, maxPlayers, minPlayers } = event

  // 获取用户信息
  const userResult = await db.collection('users').doc(wxContext.OPENID).get()
  const user = userResult.data || {}

  const activity = {
    title,
    date,
    time,
    location,
    maxPlayers,
    minPlayers: minPlayers || 4,
    creatorOpenid: wxContext.OPENID,
    creatorName: user.nickName || '',
    signedCount: 0,
    status: 'open',      // open | playing | closed | cancelled
    createTime: db.serverDate(),
  }

  const res = await db.collection('activities').add({ data: activity })

  // 创建者自动报名
  const signup = {
    activityId: res._id,
    openid: wxContext.OPENID,
    nickName: user.nickName || '',
    avatarUrl: user.avatarUrl || '',
    status: 'signed',    // signed | checked_in | no_show | cancelled
    signTime: db.serverDate(),
  }
  await db.collection('signups').add({ data: signup })

  // 更新活动报名数
  await db.collection('activities').doc(res._id).update({
    data: { signedCount: 1 }
  })

  return { code: 0, data: { activityId: res._id } }
}
