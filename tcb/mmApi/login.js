const util = require('./util.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, wxContext) => {
  const {
    APPID,
    OPENID
  } = wxContext

  const rule = {
    appID: APPID,
    openID: OPENID
  }

  let readOnly = (process.env.readOnly == 'false') ? false : true

  const db = cloud.database()
  const value = await db.collection('mmUser')
    .where(rule)
    .get()
  console.debug(value)

  if (value.data.length == 0) {
    const value1 = await db.collection('mmUser')
      .add({
        data: {
          ...rule,
          admin: false,
          avatar: {},
          createTime: db.serverDate()
        }
      })
    console.debug(value1)

    if (util.isUndefined(value1._id))
      throw 'add failed'

    return {
      user: {
        userID: value1._id,
        admin: false,
        avatar: {}
      },
      readOnly
    }
  } else if (value.data.length == 1) {
    const user = value.data[0]
    return {
      user: {
        userID: user._id,
        admin: user.admin,
        nickName: user.nickName,
        gender: user.gender,
        avatar: user.avatar
      },
      readOnly
    }
  } else
    throw 'invalid data length: ' + value.data.length
}