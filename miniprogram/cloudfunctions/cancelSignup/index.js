// 云函数：cancelSignup - 取消报名（扣5分）
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

  if (signupRes.data.length === 0) return { code: -1, errMsg: '未找到报名记录' }
  const signup = signupRes.data[0]
  if (signup.status !== 'signed') return { code: -1, errMsg: '当前状态不允许取消' }

  // 取消报名
  await db.collection('signups').doc(signup._id).update({
    data: { status: 'cancelled', cancelTime: db.serverDate() }
  })

  // 减活动计数
  await db.collection('activities').doc(activityId).update({
    data: { signedCount: _.inc(-1) }
  })

  // 扣5积分
  try {
    await db.collection('users').doc(wxContext.OPENID).update({
      data: {
        totalCancels: _.inc(1),
        points: _.inc(-5),
      }
    })
  } catch (e) {
    // 用户不存在，创建
    await db.collection('users').add({
      data: {
        _id: wxContext.OPENID,
        openid: wxContext.OPENID,
        points: -5,
        totalSignups: 0,
        totalCheckins: 0,
        totalNoShows: 0,
        totalCancels: 1,
      }
    })
  }

  return { code: 0, data: { message: '已取消，扣除5积分' } }
}
