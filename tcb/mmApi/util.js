module.exports.isEmpty = (obj) => {
  return Object.keys(obj).length == 0
}

module.exports.isNull = (obj) => {
  return obj === null
}

module.exports.isUndefined = (obj) => {
  return obj === undefined
}

module.exports.cleanObject = (obj) => {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined)
      delete obj[key]

  }
  return obj
}

module.exports.cleanFields = (obj) => {
  for (const key of Object.keys(obj)) {
    if (obj[key] === false)
      delete obj[key]
  }
  return obj
}