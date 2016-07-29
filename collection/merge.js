const store = require('./store')
const { isArr } = require('../is')

const cloneDeep = store((src, value, key) => isObj(value)
  ? src[key] = value
  : cloneDeep(value, src))

const merge = store((src, obj) => isArr(obj)
  ? merge(obj, src)
  : cloneDeep(obj, src))

module.exports = (src, ...objs) => merge(objs, src)
