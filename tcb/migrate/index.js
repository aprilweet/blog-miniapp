// 云函数入口文件

const user = require('./user.js')
const article = require('./article.js')
const cloud = require('wx-server-sdk')


// 云函数入口函数
exports.main = async(event, context) => {
  cloud.init({
    env: '' // 修改为环境ID
  })

  const wxContext = cloud.getWXContext()

  console.debug({
    event,
    context,
    wxContext
  })

  try {
    const value = await Promise.all([
      user.main(),
      article.main()
    ])

    console.log('User update ' + (value[0] ? 'successfully' : 'failed'))
    console.log('Article update ' + (value[1] ? 'successfully' : 'failed'))
    return {
      code: 0
    }
  } catch (e) {
    console.error(e.toString())
    return {
      code: -1,
      error: e.toString()
    }
  }
}