const storeObj = require('../collection/store').obj
const getKeys = o => o ? Object.getOwnPropertyNames(o) : []
const toCall = fn => fn.call.bind(fn)

module.exports = o => {
  const proto = o.prototype
  if (!proto) return
  const c = storeObj((acc, k) => acc[k] = o[k], getKeys(o))

  return storeObj((acc, k) => {
    try {
      return typeof proto[k] === 'function' && (acc[k] = toCall(proto[k]))
    } catch (err) {}
  }, getKeys(proto), c)
}
