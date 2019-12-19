const path = require('path')
const https = require('https')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async function() {
  const db = cloud.database()
  const value = await db.collection('mmArticle')
    .get()

  let ret = []
  for (const data of value.data) {
    ret.push(updateMarkdown(data.abstract)
      .then((value) => {
        return db.collection('mmArticle').doc(data._id)
          .update({
            data: {
              abstract: value
            }
          })
      }))

    ret.push(updateMarkdown(data.body)
      .then((value) => {
        return db.collection('mmArticle').doc(data._id)
          .update({
            data: {
              body: value
            }
          })
      }))
  }

  return Promise.all(ret)
    .then(() => true)
    .catch((e) => {
      console.error(e)
      return false
    })
}

async function updateMarkdown(text) {
  return common.replace(text, /\!\[(.*)\]\((.*)\)/g, async function(markdown, name, link) {
    console.debug(markdown, name, link)
    return new Promise((resolve, reject) => {
      https.get(encodeURI(link))
        .on('response', (response) => {
          resolve(cloud.uploadFile({
            cloudPath: 'mmImage/' + path.basename(link),
            fileContent: response
          }).then((value) => {
            return cloud.getTempFileURL({
              fileList: [value.fileID]
            }).then((value) => {
              const url = value.fileList[0].tempFileURL
              console.debug(url)
              return '![' + name + '](' + url + ')'
            })
          }))
        }).on('error', (error) => {
          reject(error)
        })
    })
  })
}