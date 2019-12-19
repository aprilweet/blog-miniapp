// 云函数入口文件

const common = require('./common.js')
const book = require('./book.js')
const movie = require('./movie.js')
const cloud = require('wx-server-sdk')

// 云函数入口函数
module.exports.main = async(event, context) => {
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  })
  
  const wxContext = cloud.getWXContext()

  console.debug({
    event,
    context,
    wxContext
  })

  if (!process.env.account)
    return {
      code: -1,
      error: 'environ account not set'
    }

  const config = common.config(process.env.account)

  return await Promise.all([
    book.update(config),
    movie.update(config)
  ]).then((value) => {
    console.log('Books update ' + (value[0] ? 'successfully' : 'failed'))
    console.log('Movies update ' + (value[1] ? 'successfully' : 'failed'))
    return {
      code: 0
    }
  }).catch((e) => {
    console.error(e.toString())
    return {
      code: -2,
      error: e.toString()
    }
  })
}