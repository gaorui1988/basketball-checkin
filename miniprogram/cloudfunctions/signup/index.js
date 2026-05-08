// 云函数：signup - 报名
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId } = event

  // 查活动
  const actRes = await db.collection('activities').doc(activityId).get()
  const activity = actRes.data
  if (!activity) return { code: -1, errMsg: '活动不存在' }
  if (activity.status !== 'open') return { code: -1, errMsg: '活动已截止报名' }
  if (activity.signedCount >= activity.maxPlayers) return { code: -1, errMsg: '名额已满' }

  // 查是否已报名
  const existRes = await db.collection('signups').where({
    activityId, openid: wxContext.OPENID
  }).get()
  
  if (existRes.data.length > 0) {
    const existing = existRes.data[0]
    if (existing.status === 'cancelled') {
      await db.collection('signups').doc(existing._id).update({
        data: { status: 'signed', signTime: db.serverDate(), cancelTime: null }
      })
    } else {
      return { code: -1, errMsg: '你已经报名了' }
    }
  } else {
    // 新报名 - 安全获取用户信息
    let nickName = '', avatarUrl = ''
    try {
      const userRes = await db.collection('users').doc(wxContext.OPENID).get()
      nickName = userRes.data?.nickName || ''
      avatarUrl = userRes.data?.avatarUrl || ''
    } catch (e) {}

    await db.collection('signups').add({
      data: {
        activityId,
        openid: wxContext.OPENID,
        nickName,
        avatarUrl,
        status: 'signed',
        signTime: db.serverDate(),
      }
    })
  }

  // 更新计数
  await db.collection('activities').doc(activityId).update({
    data: { signedCount: _.inc(1) }
  })

  return { code: 0, data: { message: '报名成功' } }
}
