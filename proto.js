const window = require('global/window') || global
const store = require('./collection/store')
const filter = require('./collection/filter')
const bindProto = require('./internal/bind-proto')
const toASCII = c => c.charCodeAt(0)
const LAST_UPPERCASE_LETTER = toASCII('Z')

const storeBindedProto = store(bindProto)
const filterConstructors = filter(key => {
  if (toASCII(key) > LAST_UPPERCASE_LETTER) return false
  if (key.toUpperCase() === key) return false
  const method = window[key]
  return (method.constructor === Function)
})

const protos = filterConstructors(Object.getOwnPropertyNames(window))

module.exports = storeBindedProto(protos)
