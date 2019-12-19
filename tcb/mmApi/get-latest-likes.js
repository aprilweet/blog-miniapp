const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    target,
    targetID,
    page = 1,
    pageSize = 5,
    mine = false
  } = args

  await common.checkTarget(target, targetID)

  const [likes, total, myLike] = await Promise.all([
    getLatestLikes(target, targetID, page, pageSize),
    getLikeTotal(target, targetID),
    mine ? getMine(target, targetID, user) : undefined
  ])

  return util.cleanObject({
    likes,
    total,
    mine: myLike
  })
}

async function getLikeTotal(target, targetID) {
  const db = cloud.database()
  const value = await db.collection('mmLike')
    .where(util.cleanObject({
      target,
      targetID,
      deleted: false
    }))
    .count()
  console.debug(value)

  return value.total
}

async function getLatestLikes(target, targetID, page, pageSize) {
  const db = cloud.database()
  common.addLookupUser(db.command.aggregate)
  const value = await db.collection('mmLike')
    .aggregate()
    .match(util.cleanObject({
      target,
      targetID,
      deleted: false
    }))
    .sort({
      'createTime': -1
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lookupUser()
    .project({
      likeID: '$_id',
      _id: false,
      user: true,
      createTime: true
    })
    .end()
  console.debug(value)

  return value.list
}

async function getMine(target, targetID, user) {
  const db = cloud.database()
  common.addLookupUser(db.command.aggregate)
  const value = await db.collection('mmLike')
    .aggregate()
    .match(util.cleanObject({
      target,
      targetID,
      deleted: false,
      userID: user._id
    }))
    .lookupUser()
    .project({
      likeID: '$_id',
      _id: false,
      user: true,
      createTime: true
    })
    .end()
  console.debug(value)

  return value.list[0] || null
}