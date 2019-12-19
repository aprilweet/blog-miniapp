const util = require('./util.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  if (!user.admin)
    throw 'permission denied'

  const {
    articleID,
    visible
  } = args

  if (util.isUndefined(visible))
    return {}

  const db = cloud.database()
  const value = await db.collection('mmArticle').doc(articleID)
    .update({
      data: {
        visible,
        updateTime: db.serverDate()
      }
    })
  console.debug(value)

  if (value.stats.updated != 1)
    throw 'update failed'

  return {}
}