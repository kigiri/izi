const stringify = s => JSON.stringify(s)

const toValue = (val, key) => {
  switch (val) {
    case undefined: return 'undefined'
    case null: return 'null'
    default: switch (typeof val) {
      case 'string': return stringify(val)
      case 'number': return String(val)
      default: return `src[${stringify(key)}]`
    }
  }
}

module.exports = require('./util/iter').eql
module.exports.fast = src => {
  const keys = Object.keys(src)
  const max = keys.length

  const buildTest = key =>
    `${toValue(src[key])} === collection[${stringify(key)}]`

  const test = Function(['isObj', 'src', 'collection'],
    'return isObj(collection) && '+ keys.map(buildTest).join(' && '))

  return collection => test(isObj, src, collection)
}
