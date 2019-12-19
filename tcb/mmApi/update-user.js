const util = require('./util.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    nickName,
    avatar,
    gender
  } = args

  const data = util.cleanObject({
    nickName,
    avatar,
    gender
  })
  if (util.isEmpty(data))
    return {}

  const db = cloud.database()
  const value = await db.collection('mmUser').doc(user._id)
    .update({
      data: {
        ...data,
        updateTime: db.serverDate()
      }
    })
  console.debug(value)

  if (value.stats.updated != 1)
    throw 'update failed'

  return {}
}