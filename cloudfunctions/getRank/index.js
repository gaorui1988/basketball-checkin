// 云函数：getRank - 排行榜
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { sortBy = 'points' } = event

  const res = await db.collection('users')
    .orderBy(sortBy, 'desc')
    .limit(50)
    .get()

  const rank = res.data.map(u => ({
    openid: u.openid,
    nickName: u.nickName,
    avatarUrl: u.avatarUrl,
    points: u.points || 0,
    totalSignups: u.totalSignups || 0,
    totalCheckins: u.totalCheckins || 0,
    totalNoShows: u.totalNoShows || 0,
  }))

  return { code: 0, data: rank }
}
