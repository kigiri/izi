const iter = require('./util/iter')

const find = iter.magic({
  test: true,
  ok: 'collection[key]',
  nok: 'undefined',
})

find.key = iter.magic({
  test: true,
  ok: 'key',
  nok: 'undefined',
})

module.exports = find