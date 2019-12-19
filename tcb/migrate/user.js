const path = require('path')
const https = require('https')
const common = require('./common.js')
const cloud = require('wx-server-sdk')

module.exports.main = async function() {
  const db = cloud.database()
  const value = await db.collection('mmUser')
    .where({
      'avatar.url': db.command.neq(null)
    })
    .get()

  let ret = []
  for (const data of value.data) {
    ret.push(updateAvatar(data.avatar.url, data._id)
      .then((value) => {
        return db.collection('mmUser').doc(data._id)
          .update({
            data: {
              'avatar.fileID': value
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

async function updateAvatar(url, userID) {
  console.debug(url, userID)
  return new Promise((resolve, reject) => {
    https.get(encodeURI(url))
      .on('response', (response) => {
        cloud.uploadFile({
          cloudPath: 'mmAvatar/' + userID,
          fileContent: response
        }).then((value) => {
          console.debug(value.fileID)
          resolve(value.fileID)
        }).catch((reason) => {
          reject(reason)
        })
      }).on('error', (error) => {
        reject(error)
      })
  })
}