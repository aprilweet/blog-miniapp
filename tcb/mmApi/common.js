const util = require('./util.js')
const cloud = require('wx-server-sdk')

module.exports.userInfo = async(wxContext) => {
  const {
    APPID,
    OPENID
  } = wxContext

  const cond = util.cleanObject({
    appID: APPID,
    openID: OPENID
  })
  if (util.isEmpty(cond))
    throw 'invalid wxContext'

  const db = cloud.database()
  const value = await db.collection('mmUser')
    .where(cond)
    .get()
  console.debug(value)

  if (value.data.length != 1)
    throw 'invalid data length: ' + value.data.length

  return value.data[0]
}

module.exports.checkTarget = async(target, targetID) => {
  var doc
  const db = cloud.database()
  switch (target) {
    case 'system':
      doc = db.collection('mmMe')
      break
    case 'article':
      if (util.isUndefined(targetID))
        throw 'invalid targetID'
      doc = db.collection('mmArticle')
        .where({
          _id: targetID
        })
      break
    default:
      throw 'invalid target: ' + target
  }

  const value = await doc.count()
  console.debug(value)

  if (value.total != 1)
    throw 'invalid total: ' + value.total
}

module.exports.addLookupUser = (type) => {
  Object.prototype.lookupUser = function() {
    this.lookup({
      from: 'mmUser',
      localField: 'userID',
      foreignField: '_id',
      as: 'user'
    }).addFields({
      user: type.let({
        vars: {
          user: type.arrayElemAt(['$user', 0])
        },
        in: {
          userID: '$$user._id',
          nickName: '$$user.nickName',
          avatar: '$$user.avatar',
          gender: '$$user.gender'
        }
      })
    })

    return this
  }
}

module.exports.getFile = async(fileID) => {
  const value = await cloud.downloadFile({
    fileID
  })
  console.debug(value)

  const buffer = value.fileContent
  return buffer.toString('utf8')
}