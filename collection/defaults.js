const store = require('./store')
const { isArr, isUndef } = require('../is')
const has = Object.hasOwnProperty.call.bind(Object.hasOwnProperty)

const cloneDeep = store((src, value, key) => isObj(value)
  ? (has(src, key) || (src[key] = value))
  : cloneDeep(value, src))

const merge = store((src, obj) => isArr(obj)
  ? merge(obj, src)
  : cloneDeep(obj, src))

module.exports = (src, ...objs) => merge(objs, src)
