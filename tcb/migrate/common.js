module.exports.replace = async function(text, reg, asyncReplacer) {
  let ret = []
  text.replace(reg, (...args) => {
    ret.push(asyncReplacer(...args))
  })
  const data = await Promise.all(ret)
  return text.replace(reg, () => data.shift())
}