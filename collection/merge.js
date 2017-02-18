const store = require('./store')
const { isArr, isObj } = require('../is')
const H = Object.create.bind(Object, null)
const cloneDeep = store((src, value, key) => isObj(value)
  ? cloneDeep(value, src[key] || (src[key] = H()))
  : src[key] = value)

const merge = store((src, obj) => isArr(obj)
  ? merge(obj, src)
  : cloneDeep(obj, src))

module.exports = (src, ...objs) => merge(objs, src)
