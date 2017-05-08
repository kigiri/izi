const { isInt, isFn, isObj, isStr } = require('../../is')
const magic = require('./magic')

const polyIterate = (method, fn, collection, extra) => {
  if (!collection) return collection
  return isInt(collection.length)
    ? method.arr(fn, collection, extra)
    : method.obj(fn, collection, extra)
}

const currify = fn => function() {
  switch (arguments.length) {
    case 1: return () => fn(arguments[0])
    case 2: return fn(arguments[0], arguments[1])
    case 3: return fn(arguments[0], arguments[1], arguments[2])
  }
}

const makePolymorphic = method => {
  const m = function () {
    switch (arguments.length) {
      case 1: return (a, b) => polyIterate(method, arguments[0], a, b)
      case 2: return polyIterate(method, arguments[0], arguments[1])
      case 3: return polyIterate(method, arguments[0], arguments[1],
        arguments[2])
    }
  }

  m.arr = currify(method.arr)
  m.obj = currify(method.obj)

  return m
}

makePolymorphic.magic = (ok, nok) => makePolymorphic({
  obj: magic('obj', ok, nok),
  arr: magic('arr', ok, nok),
})

const eql = makePolymorphic.magic({
  args: [ 'src', 'collection' ],
  pre: '//',
  post: '\nif (src[key] !== collection[key]) return false',
  nok: true,
})

makePolymorphic.eql = eql
makePolymorphic.currify = currify

module.exports = makePolymorphic
