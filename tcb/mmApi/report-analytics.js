const util = require('./util.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    event,
    data
  } = args

  const detail = util.cleanObject({
    event,
    data
  })
  if (util.isEmpty(data))
    return {}

  const db = cloud.database()
  const value = await db.collection('mmAnalytics')
    .add({
      data: {
        ...detail,
        createTime: db.serverDate()
      }
    })

  if (util.isUndefined(value._id))
    throw 'add failed'

  return {}
}