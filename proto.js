const window = require('global/window')
const bindProto = require('./internal/bind-proto')
const toASCII = c => String.charCodeAt.call(c, 0)
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
