const iter = require('./util/iter')
const magic = require('./util/magic')

const map = iter.magic('result')
map.toArr = iter.currify(magic('obj', {
  result: 'Array(max)',
  pre: 'result[i] = ',
}))

module.exports = map
