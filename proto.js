const global = require('./global')
const store = require('./collection/store')
const filter = require('./collection/filter')
const bindProto = require('./internal/bind-proto')
const toASCII = c => c.charCodeAt(0)
const LAST_UPPERCASE_LETTER = toASCII('Z')

const storeBindedProto = store((s, key) => s[key] = bindProto(global[key]))
const filterConstructors = filter(key => {
  if (toASCII(key) > LAST_UPPERCASE_LETTER) return false
  if (key.toUpperCase() === key) return false
  const method = global[key]
  return (method.constructor === Function)
})

const protos = filterConstructors(Object.getOwnPropertyNames(global))

module.exports = storeBindedProto(protos)
