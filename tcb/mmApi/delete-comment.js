const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    commentID
  } = args

  const db = cloud.database()
  const value = await db.collection('mmComment').doc(commentID)
    .update({
      data: {
        deleted: true,
        updateTime: db.serverDate()
      }
    })

  if (value.stats.updated != 1)
    throw 'update failed'

  return {}
}