// utils/api.js - 云函数调用封装
const callCloudFn = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        if (res.result && res.result.code === 0) {
          resolve(res.result.data)
        } else {
          reject(res.result || res)
        }
      },
      fail: reject,
    })
  })
}

// 创建活动
const createActivity = (data) => callCloudFn('createActivity', data)

// 报名
const signup = (activityId) => callCloudFn('signup', { activityId })

// 取消报名
const cancelSignup = (activityId) => callCloudFn('cancelSignup', { activityId })

// 签到
const checkin = (activityId) => callCloudFn('checkin', { activityId })

// 获取活动列表
const getActivityList = (status) => callCloudFn('getActivityList', { status })

// 获取活动详情
const getActivityDetail = (activityId) => callCloudFn('getActivityDetail', { activityId })

// 获取用户统计
const getUserStats = () => callCloudFn('getUserStats')

// 获取排行榜
const getRank = () => callCloudFn('getRank')

// 更新用户资料
const updateUserProfile = (data) => callCloudFn('updateUserProfile', data)

// 获取我的活动
const getMyActivities = () => callCloudFn('getMyActivities')

// 结算活动（发起人用）
const settleActivity = (activityId, noShowOpenids) => callCloudFn('settleActivity', { activityId, noShowOpenids })

module.exports = {
  createActivity,
  signup,
  cancelSignup,
  checkin,
  getActivityList,
  getActivityDetail,
  getUserStats,
  getRank,
  updateUserProfile,
  getMyActivities,
  settleActivity,
}
