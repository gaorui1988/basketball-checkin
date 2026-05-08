// 云函数：getActivityDetail
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId } = event

  // 活动详情
  const actRes = await db.collection('activities').doc(activityId).get()
  if (!actRes.data) return { code: -1, errMsg: '活动不存在' }

  // 报名列表
  const signupsRes = await db.collection('signups')
    .where({ activityId })
    .orderBy('signTime', 'asc')
    .get()

  // 我的报名
  const mySignup = signupsRes.data.find(s => s.openid === wxContext.OPENID) || null

  // 我的统计（安全获取）
  let myStats = null
  try {
    const userRes = await db.collection('users').doc(wxContext.OPENID).get()
    myStats = userRes.data || null
  } catch (e) {}

  return {
    code: 0,
    data: {
      activity: actRes.data,
      signups: signupsRes.data.map(s => ({
        _id: s._id,
        openid: s.openid,
        nickName: s.nickName || '匿名球友',
        avatarUrl: s.avatarUrl || '',
        status: s.status,
        signTime: s.signTime,
      })),
      mySignup,
      myStats,
      isCreator: actRes.data.creatorOpenid === wxContext.OPENID,
    }
  }
}
