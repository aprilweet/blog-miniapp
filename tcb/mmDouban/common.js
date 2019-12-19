const request = require('request-promise-native')
const cloud = require('wx-server-sdk')

String.prototype.trim = function() {
  return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
};

String.prototype.strip = function() {
  return this.trim().replace(/\s+/g, ' ')
}

module.exports.config = function(account) {
  return {
    book_site: 'https://book.douban.com',
    book_url: '/people/' + account + '/all',

    movie_site: 'https://movie.douban.com',
    wish_url: '/people/' + account + '/wish',
    do_url: '/people/' + account + '/do',
    collect_url: '/people/' + account + '/collect'
  }
}

module.exports.get = async function(url, timeout = 3, retry = 3) {
  while (--retry >= 0) {
    const ret = await request.get(url, {
      timeout: timeout * 1000,
      resolveWithFullResponse: true
    }).then(response => {
      if (response.statusCode == 200)
        return response.body
      else
        return undefined
    }).catch(e => {
      console.error(e.toString())
      return undefined
    })

    if (ret)
      return ret
  }
  throw 'get url failed: ' + url
}

module.exports.getRating = function(rating) {
  return parseInt(rating.match(/\d/g)[0])
}

module.exports.addHalf = async function(type, items) {
  const db = cloud.database()
  let ret = []
  for (item of items) {
    ret.push(db.collection('mmDouban')
      .add({
        data: {
          type,
          visible: false,
          ...item
        }
      }))
  }
  return Promise.all(ret)
}

module.exports.addRollback = async function(type) {
  const db = cloud.database()
  return db.collection('mmDouban')
    .where({
      type,
      visible: false
    }).remove()
}

module.exports.addConfirm = async function(type) {
  const db = cloud.database()
  await db.collection('mmDouban')
    .where({
      type,
      visible: true
    }).remove()

  return db.collection('mmDouban')
    .where({
      type,
      visible: false
    }).update({
      data: {
        visible: true
      }
    })
}