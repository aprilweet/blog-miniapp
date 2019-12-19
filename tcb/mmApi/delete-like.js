const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    likeID
  } = args

  const db = cloud.database()
  const value = await db.collection('mmLike').doc(likeID)
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