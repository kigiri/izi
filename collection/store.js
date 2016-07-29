const iter = require('./util/iter')

module.exports = iter.magic({
  acc: 'Object.create(null)',
  pre: ' ',
})
