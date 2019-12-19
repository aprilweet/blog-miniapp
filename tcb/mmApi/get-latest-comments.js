const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const {
    target,
    targetID,
    page = 1,
    pageSize = 5
  } = args

  await common.checkTarget(target, targetID)

  const [comments, total] = await Promise.all([
    getLatestComments(target, targetID, page, pageSize),
    getCommentTotal(target, targetID)
  ])

  return {
    comments,
    total
  }
}

async function getCommentTotal(target, targetID) {
  const db = cloud.database()
  const value = await db.collection('mmComment')
    .where(util.cleanObject({
      target,
      targetID,
      deleted: false,
    }))
    .count()
  console.debug(value)

  return value.total
}

async function getLatestComments(target, targetID, page, pageSize) {
  const db = cloud.database()
  common.addLookupUser(db.command.aggregate)
  const value = await db.collection('mmComment')
    .aggregate()
    .match(util.cleanObject({
      target,
      targetID,
      deleted: false,
    }))
    .sort({
      'createTime': -1
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lookupUser()
    .project({
      commentID: '$_id',
      _id: false,
      user: true,
      createTime: true,
      body: true
    })
    .end()
  console.debug(value)

  return value.list
}