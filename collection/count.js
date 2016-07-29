const iter = require('./util/iter')

module.exports = iter.magic({
  acc: '0',
  pre: 'acc += ',
  post: ' ? 0 : 1'
})
