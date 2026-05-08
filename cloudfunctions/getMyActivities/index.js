// 云函数：getMyActivities
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const signups = await db.collection('signups')
    .where({ openid: wxContext.OPENID })
    .orderBy('signTime', 'desc')
    .limit(20)
    .get()

  // 补充活动标题
  const result = []
  for (const s of signups.data) {
    try {
      const actRes = await db.collection('activities').doc(s.activityId).get()
      if (actRes.data) {
        result.push({
          _id: s._id,
          activityId: s.activityId,
          activityTitle: actRes.data.title,
          status: s.status,
          signTime: s.signTime,
        })
      }
    } catch (e) {
      // 活动可能已被删除
    }
  }

  return { code: 0, data: result }
}
