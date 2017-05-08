const iter = require('./util/iter')
const { isFn } = require('../is')

module.exports = iter.magic('accumulator')
module.exports.from = (fn, acc) => isFn(acc)
  ? collection => reduce(fn, collection, acc())
  : collection => reduce(fn, collection, acc)
