const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const isAdmin = user.admin

  const {
    page = 1, pageSize = 5
  } = args

  const [articles, total] = await Promise.all([
    getLatestArticles(isAdmin, page, pageSize),
    getArticleTotal(isAdmin)
  ])

  return {
    articles,
    total
  }
}

async function getArticleTotal(isAdmin) {
  const db = cloud.database()
  const value = await db.collection('mmArticle')
    .where(util.cleanObject({
      deleted: false,
      visible: isAdmin ? undefined : true
    }))
    .count()
  console.debug(value)

  return value.total
}

async function getLatestArticles(isAdmin, page, pageSize) {
  const db = cloud.database()
  common.addLookupUser(db.command.aggregate)
  const value = await db.collection('mmArticle')
    .aggregate()
    .match(util.cleanObject({
      deleted: false,
      visible: isAdmin ? undefined : true
    }))
    .sort({
      'createTime': -1
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lookupUser()
    .project({
      articleID: '$_id',
      _id: false,
      title: true,
      user: true,
      author: true,
      createTime: true,
      abstract: true
    })
    .end()
  console.debug(value)

  return value.list
}