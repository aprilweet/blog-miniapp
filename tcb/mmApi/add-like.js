const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    target,
    targetID
  } = args

  await common.checkTarget(target, targetID)

  const db = cloud.database()
  const value = await db.collection('mmLike')
    .add({
      data: util.cleanObject({
        target,
        targetID,
        userID: user._id,
        createTime: db.serverDate(),
        deleted: false
      })
    })
  console.debug(value)

  if (util.isUndefined(value._id))
    throw 'add failed'

  return {
    likeID: value._id
  }
}