// 云函数：checkin - 签到（+10分）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId } = event

  // 查报名记录
  const signupRes = await db.collection('signups').where({
    activityId, openid: wxContext.OPENID
  }).get()

  if (signupRes.data.length === 0) return { code: -1, errMsg: '未报名' }
  const signup = signupRes.data[0]
  if (signup.status === 'checked_in') return { code: -1, errMsg: '已签到过了' }
  if (signup.status === 'no_show') return { code: -1, errMsg: '已被标记未到场' }
  if (signup.status === 'cancelled') return { code: -1, errMsg: '已取消报名' }

  // 签到
  await db.collection('signups').doc(signup._id).update({
    data: { status: 'checked_in', checkinTime: db.serverDate() }
  })

  // 更新用户积分
  let bonusPoints = 10
  try {
    const userRes = await db.collection('users').doc(wxContext.OPENID).get()
    if (userRes.data) {
      const lastDate = userRes.data.lastCheckinDate
      let consecutive = 1
      if (lastDate) {
        const diffDays = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24))
        if (diffDays <= 14) consecutive = (userRes.data.consecutiveCheckins || 0) + 1
      }
      if (consecutive >= 5 && consecutive % 5 === 0) bonusPoints += 15

      await db.collection('users').doc(wxContext.OPENID).update({
        data: {
          points: _.inc(bonusPoints),
          totalSignups: _.inc(1),
          totalCheckins: _.inc(1),
          lastCheckinDate: new Date(),
          consecutiveCheckins: consecutive,
        }
      })
    } else {
      // 用户未注册，创建记录
      await db.collection('users').add({
        data: {
          _id: wxContext.OPENID,
          openid: wxContext.OPENID,
          points: bonusPoints,
          totalSignups: 1,
          totalCheckins: 1,
          totalNoShows: 0,
          totalCancels: 0,
          lastCheckinDate: new Date(),
          consecutiveCheckins: 1,
        }
      })
    }
  } catch (e) {
    // 用户不存在，新建
    await db.collection('users').add({
      data: {
        _id: wxContext.OPENID,
        openid: wxContext.OPENID,
        points: bonusPoints,
        totalSignups: 1,
        totalCheckins: 1,
        totalNoShows: 0,
        totalCancels: 0,
        lastCheckinDate: new Date(),
        consecutiveCheckins: 1,
      }
    })
  }

  return { code: 0, data: { message: '签到成功' } }
}
