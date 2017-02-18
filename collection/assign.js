const store = require('./store')
const { isArr } = require('../is')

const clone = store((src, value, key) => src[key] = value)
const assign = store((src, obj) => isArr(obj)
  ? assign(obj, src)
  : clone(obj, src))

module.exports = (src, ...objs) => assign(objs, src)
