// 云函数：getActivityList
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { status = 'open' } = event

  let activities
  if (status === 'open') {
    // 即将开始：状态为open且日期 >= 今天
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    activities = await db.collection('activities')
      .where({ status: 'open', date: _.gte(todayStr) })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
  } else if (status === 'my') {
    // 我报名的
    const mySignups = await db.collection('signups')
      .where({ openid: wxContext.OPENID, status: _.neq('cancelled') })
      .orderBy('signTime', 'desc')
      .limit(20)
      .get()

    const activityIds = mySignups.data.map(s => s.activityId)
    if (activityIds.length === 0) return { code: 0, data: [] }

    activities = await db.collection('activities')
      .where({ _id: _.in(activityIds) })
      .orderBy('createTime', 'desc')
      .get()
  } else {
    // 历史记录：已结束的活动
    activities = await db.collection('activities')
      .where({ status: _.in(['closed', 'playing']) })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
  }

  return { code: 0, data: activities.data }
}
