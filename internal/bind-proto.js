const storeObj = require('../collection/store').obj
const getKeys = o => o ? Object.getOwnPropertyNames(o) : []
const toCall = fn => fn.call.bind(fn)

module.exports = o => {
  const proto = o.prototype
  const c = storeObj((acc, k) => acc[k] = o[k], getKeys(o))
  return storeObj((acc, k) => acc[k] = toCall(proto[k]), getKeys(proto), c)
}
