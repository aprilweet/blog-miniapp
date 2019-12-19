// 云函数入口文件

const util = require('./util.js')
const common = require('./common.js')
const cloud = require('wx-server-sdk')


// api函数通过异常报错
const api = {
  Login: require('./login.js').main,
  UpdateUser: require('./update-user.js').main,
  AboutMe: require('./about-me.js').main,
  GetArticle: require('./get-article.js').main,
  GetLatestArticles: require('./get-latest-articles.js').main,
  GetLatestComments: require('./get-latest-comments.js').main,
  GetLatestLikes: require('./get-latest-likes.js').main,
  ModifyArticle: require('./modify-article.js').main,
  AddComment: require('./add-comment.js').main,
  DeleteComment: require('./delete-comment.js').main,
  AddLike: require('./add-like.js').main,
  DeleteLike: require('./delete-like.js').main,
  GetDouban: require('./get-douban.js').main,
  ReportAnalytics: require('./report-analytics.js').main
}

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

  if (util.isUndefined(event.api) || util.isUndefined(event.args)) {
    return {
      code: -1,
      error: 'invalid event'
    }
  } else if (util.isUndefined(api[event.api])) {
    return {
      code: -2,
      error: 'invalid event api: ' + event.api
    }
  } else {
    var arg2
    if (event.api == "Login") {
      arg2 = wxContext
    } else {
      try {
        const user = await common.userInfo(wxContext)
        arg2 = user
      } catch (e) {
        return {
          code: -3,
          error: e.toString()
        }
      }
    }

    try {
      return {
        code: 0,
        data: await api[event.api](event.args, arg2)
      }
    } catch (e) {
      return {
        code: -4,
        error: e.toString()
      }
    }
  }
}