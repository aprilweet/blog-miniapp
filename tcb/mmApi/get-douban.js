const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    page = 1, pageSize = 5
  } = args

  const [douban, total] = await Promise.all([
    getDouban(page, pageSize),
    getDoubanTotal()
  ])

  return {
    douban,
    total
  }
}

async function getDoubanTotal() {
  const db = cloud.database()
  const value = await db.collection('mmDouban')
    .where({
      visible: true
    })
    .count()
  console.debug(value)

  return value.total
}

async function getDouban(page, pageSize) {
  const db = cloud.database()
  const value = await db.collection("mmDouban")
    .aggregate()
    .match({
      visible: true
    })
    .sort({
      'date': -1
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .project({
      _id: false,
      type: true,
      date: true,
      state: true,
      rating: true,
      comment: true,
      info: true
    })
    .end()
  console.debug(value)

  return value.list
}