const buildTest = require('../internal/poly/test')
const emit = require('../internal/poly/emit')

const filter = (setter, emiter, test) => {
  const fn = buildTest(test)

  return emit(setter, emiter, val => fn(val) && setter(val))
}

module.exports = filter
