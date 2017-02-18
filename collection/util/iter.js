const { isInt, isFn, isObj, isStr, isNum } = require('../../is')
const magic = require('./magic')

const equalTest = test => {
  const eqlTest = val => val === test
  if (isNum(test)) return isNaN(test) ? Number.isNaN : eqlTest
  if (test) {
    switch (test.constructor) {
      case null:
      case undefined:
      case Object: return eql.fast(test)
      case Array: return eql.arr(test)
    }
  }
  return eqlTest
}

const testFn = test => {
  return test // bypass this feature for now
  if (isFn(test)) return test
  if (test.constructor === RegExp) return val => test.test(val)
  if (test && isFn(test.test)) return test.test.bind(test)
  return equalTest(test)
}


const polyIterate = (method, fn, collection, extra) => {
  if (!collection) return collection
  return isInt(collection.length)
    ? method.arr(fn, collection, extra)
    : method.obj(fn, collection, extra)
}

const currify = fn => function() {
  switch (arguments.length) {
    case 1: return fn.bind(null, testFn(arguments[0]))
    case 2: return fn(testFn(arguments[0]), arguments[1])
    case 3: return fn(testFn(arguments[0]), arguments[1], arguments[2])
  }
}

const makePolymorphic = method => {
  const m = function () {
    switch (arguments.length) {
      case 1: return polyIterate.bind(null, method, testFn(arguments[0]))
      case 2: return polyIterate(method, testFn(arguments[0]), arguments[1])
      case 3: return polyIterate(method, testFn(arguments[0]), arguments[1],
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

const stringify = s => JSON.stringify(s)

eql.fast = src => {
  const keys = Object.keys(src)
  const max = keys.length

  const toValue = (val, key) => {
    switch (val) {
      case undefined: return 'undefined'
      case null: return 'null'
      default: switch (typeof val) {
        case 'string': return stringify(val)
        case 'number': return String(val)
        default: return `src[${stringify(key)}]`
      }
    }
  }

  const buildTest = key =>
    `${toValue(src[key])} === collection[${stringify(key)}]`

  const test = new Function(['isObj', 'src', 'collection'],
    'return isObj(collection) && '+ keys.map(buildTest).join(' && '))

  return test.bind(null, isObj, src)
}

makePolymorphic.eql = eql
makePolymorphic.test = testFn
makePolymorphic.currify = currify

module.exports = makePolymorphic
