const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async(args, user) => {
  const isAdmin = user.admin

  const {
    articleID
  } = args

  const [article, next, prev] = await Promise.all([
    getArticle(articleID),
    getSibling(articleID, isAdmin, 'next'),
    getSibling(articleID, isAdmin, 'prev')
  ])

  return {
    article,
    next,
    prev
  }
}

async function getArticle(articleID) {
  const db = cloud.database()
  common.addLookupUser(db.command.aggregate)
  const value = await db.collection("mmArticle")
    .aggregate()
    .match({
      _id: articleID
    })
    .lookupUser()
    .project({
      articleID: '$_id',
      _id: false,
      body: true,
      bodyInFile: true,
      classification: true,
      createTime: true,
      sourceLink: true,
      tags: true,
      title: true,
      user: true,
      visible: true
    })
    .end()
  console.debug(value)

  if (value.list.length != 1)
    throw 'invalid list length: ' + value.list.length

  let article = value.list[0]
  if (article.bodyInFile) {
    article.body = await common.getFile(article.body)
    delete article.bodyInFile
  }

  return article
}

async function getSibling(articleID, isAdmin, type) {
  const db = cloud.database()
  const $ = db.command.aggregate

  var op
  if (type == 'prev')
    op = $.add
  else if (type == 'next')
    op = $.subtract
  else
    throw 'invalid type: ' + type

  const value = await db.collection('mmArticle')
    .aggregate()
    .match(util.cleanObject({
      deleted: false,
      visible: isAdmin ? undefined : true
    }))
    .sort({
      'createTime': -1
    })
    .group({
      _id: 'all',
      ids: $.push('$_id'),
      titles: $.push('$title')
    })
    .project({
      _id: false,
      article: $.let({
        vars: {
          index: op([$.indexOfArray(['$ids', articleID]), 1]),
        },
        in: $.cond({
          if: $.and([$.gte(['$$index', 0]), $.lt(['$$index', $.size('$ids')])]),
          then: {
            articleID: $.arrayElemAt(['$ids', '$$index']),
            title: $.arrayElemAt(['$titles', '$$index'])
          },
          else: null
        })
      })
    })
    .end()
  console.debug(value)

  if (util.isEmpty(value.list))
    return null
  else if (value.list.length != 1)
    throw 'invalid list length: ' + value.list.length

  return value.list[0].article
}