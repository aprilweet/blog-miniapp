const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const db = cloud.database()

  const value = await db.collection('mmMe').get()
  console.debug(value)

  if (value.data.length != 1)
    throw 'invalid data length: ' + value.data.length

  return value.data[0]
}