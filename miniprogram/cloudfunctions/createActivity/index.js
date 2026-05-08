// 云函数：createActivity
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, date, time, location, maxPlayers, minPlayers } = event

  // 安全获取用户信息（用户可能未注册）
  let nickName = ''
  try {
    const userRes = await db.collection('users').doc(wxContext.OPENID).get()
    nickName = userRes.data?.nickName || ''
  } catch (e) {
    // 用户不存在，匿名创建
  }

  const activity = {
    title,
    date,
    time,
    location,
    maxPlayers,
    minPlayers: minPlayers || 4,
    creatorOpenid: wxContext.OPENID,
    creatorName: nickName,
    signedCount: 0,
    status: 'open',
    createTime: db.serverDate(),
  }

  const res = await db.collection('activities').add({ data: activity })

  // 创建者自动报名
  await db.collection('signups').add({
    data: {
      activityId: res._id,
      openid: wxContext.OPENID,
      nickName: nickName,
      avatarUrl: '',
      status: 'signed',
      signTime: db.serverDate(),
    }
  })

  // 更新活动报名数
  await db.collection('activities').doc(res._id).update({
    data: { signedCount: 1 }
  })

  return { code: 0, data: { activityId: res._id } }
}
