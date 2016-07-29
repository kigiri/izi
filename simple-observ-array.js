const observ = require('./emiter/observ')
const each = require('./collection/each')
const is = require('./is')

const arrProto = Array.prototype

if (!is.fn(Array.from)) {
  throw new Error('need polyfill for Array.from')
}

const accessors = [
  'includes',
  'indexOf',
  'lastIndexOf',
  'toLocaleString',
  'toSource',
  'toString',
]

const pure = [
  'concat',
  'filter',
  'join',
  'map',
  'reduce',
  'slice',
]

const mutators = [
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]

module.exports = list => {
  is.arr(list) || (list = Array.from(list))
  const obs = observ(list)

  each(key => {
    const fn = arrProto[key]
    obs[key] = function () {
      return fn.apply(list, arguments)
    }
  }, accessors)

  each(key => {
    const fn = arrProto[key]
    obs[key] = function () {
      fn.apply(list, arguments)
      return obs.set(list)
    }
  }, mutators)

  each(key => {
    const fn = arrProto[key]
    obs[key] = function () {
      return obs.set(list = fn.apply(list, arguments))
    }
  }, pure)

  return obs
}