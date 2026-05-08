// utils/util.js
const formatTime = date => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${min}`
}

const formatDate = date => {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}月${day}日`
}

const formatWeekday = date => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date(date).getDay()]
}

const isToday = date => {
  const d = new Date(date)
  const t = new Date()
  return d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
}

const isPast = date => {
  return new Date(date) < new Date()
}

const getSignupStatusText = (status) => {
  const map = {
    signed: '已报名',
    checked_in: '已签到 ✅',
    no_show: '未到场 ❌',
    cancelled: '已取消',
  }
  return map[status] || status
}

const getGradeBadge = (points) => {
  if (points >= 200) return { label: '🏆 球王', color: '#f1c40f' }
  if (points >= 100) return { label: '⭐ 球星', color: '#2ecc71' }
  if (points >= 50) return { label: '👍 靠谱', color: '#3498db' }
  if (points >= 0) return { label: '🌱 新手', color: '#95a5a6' }
  if (points >= -50) return { label: '⚠️ 警惕', color: '#e67e22' }
  return { label: '🤡 鸽子王', color: '#e74c3c' }
}

module.exports = {
  formatTime,
  formatDate,
  formatWeekday,
  isToday,
  isPast,
  getSignupStatusText,
  getGradeBadge,
}
