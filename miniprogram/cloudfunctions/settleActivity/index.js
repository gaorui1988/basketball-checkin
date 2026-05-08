// 云函数：settleActivity - 活动结算（标记放鸽子）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId, noShowOpenids = [] } = event

  // 验证发起人身份
  const actRes = await db.collection('activities').doc(activityId).get()
  if (!actRes.data) return { code: -1, errMsg: '活动不存在' }
  if (actRes.data.creatorOpenid !== wxContext.OPENID) {
    return { code: -1, errMsg: '只有发起人才能结算' }
  }

  // 获取所有已报名但未签到的
  const signupsRes = await db.collection('signups')
    .where({ activityId, status: _.in(['signed', 'checked_in']) })
    .get()

  let checkedIn = 0
  let noShows = 0

  for (const s of signupsRes.data) {
    if (noShowOpenids.includes(s.openid)) {
      // 标记放鸽子
      await db.collection('signups').doc(s._id).update({
        data: { status: 'no_show' }
      })
      // 扣用户20分（安全获取用户，不存在则创建）
      try {
        await db.collection('users').doc(s.openid).update({
          data: {
            totalNoShows: _.inc(1),
            points: _.inc(-20),
          }
        })
      } catch (e) {
        await db.collection('users').add({
          data: {
            _id: s.openid,
            openid: s.openid,
            points: -20,
            totalNoShows: 1,
            totalSignups: 0,
            totalCheckins: 0,
            totalCancels: 0,
          }
        })
      }
      noShows++
    } else if (s.status === 'checked_in') {
      checkedIn++
    }
  }

  // 活动结束
  await db.collection('activities').doc(activityId).update({
    data: { status: 'closed' }
  })

  return {
    code: 0,
    data: {
      message: `结算完成，${checkedIn}人到场，${noShows}人放鸽子`,
    }
  }
}
