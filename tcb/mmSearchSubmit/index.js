// 云函数入口文件

const cloud = require('wx-server-sdk')

// 云函数入口函数
exports.main = async(event, context) => {
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  })

  const wxContext = cloud.getWXContext()

  console.debug({
    event,
    context,
    wxContext
  })

  let batch = process.env.batch
  if (!batch)
    batch = 100

  const articles = await getArticlesID()

  let pages = []
  for (let i = 0; i < articles.length; ++i) {
    const article = articles[i]
    pages.push({
      path: 'pages/article/index',
      query: 'articleID=' + article._id
    })

    if (pages.length == batch || i == articles.length - 1) {
      console.debug(pages)
      const value = await cloud.openapi.search.submitPages({
        pages
      })
      console.debug(value)
      if (value.errCode != 0) {
        return {
          code: -1,
          error: value.errMsg
        }
      }
      pages = []
    }
  }

  return {
    code: 0
  }
}

async function getArticlesID() {
  const db = cloud.database()
  const value = await db.collection('mmArticle')
    .where({
      deleted: false,
      visible: true
    })
    .field({
      _id: true
    })
    .get()
  console.debug(value)

  return value.data
}