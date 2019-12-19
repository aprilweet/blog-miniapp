const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    target,
    targetID,
    body
  } = args

  await common.checkTarget(target, targetID)

  const db = cloud.database()
  const value = await db.collection('mmComment')
    .add({
      data: util.cleanObject({
        target,
        targetID,
        userID: user._id,
        createTime: db.serverDate(),
        deleted: false,
        body
      })
    })
  console.debug(value)

  if (util.isUndefined(value._id))
    throw 'add failed'

  return {
    commentID: value._id
  }
}