const { isFn, isArr, isPrimitive, isObj } = require('../is')
const sub = require('./subscribe')
const each = require('../collection/each')
const autoCurry = require('../auto-curry')

let makeObserv, isObserv
if (typeof Symbol === 'undefined') {
  isObserv = obs => obs && obs.hasOwnProperty('__$$_observ_symbol_$$__')
  makeObserv = obs => {
    Object.defineProperty(obs, '__$$_observ_symbol_$$__', { enumerable: false })
    return obs
  }
} else {
  const observSymbol = Symbol('Observ')
  isObserv = obs => obs && obs[observSymbol]
  makeObserv = obs => (obs[observSymbol] = true, obs)
}

const observ = value => {
  const listeners = []
  const subscriber = fn => sub(listeners, fn, value)
  const sendValue = each(fn => fn(value))

  subscriber.set = val => {
    value = val
    sendValue(listeners)
  }

  return makeObserv(subscriber)
}

const defaultCheck = (a, b) => a !== b
const observCheck = (value, check = defaultCheck) => {
  const listeners = []
  const subscriber = fn => sub(listeners, fn, value)
  const sendValue = each(fn => fn(value))

  subscriber.set = val => {
    if (!check(val, value)) return
    value = val
    sendValue(listeners)
  }

  subscriber.setCheck = newCheck => check = newCheck

  return makeObserv(subscriber)
}

const observOnce = () => {
  let listeners = []
  const subscriber = fn => sub(listeners, fn)

  subscriber.set = val => {
    if (!listeners) return console.warn('trigger a once multiple times')
    each(fn => fn(val), listeners)
    listeners = subscriber.set = null
  }

  return makeObserv(subscriber)
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

const observArray = list => {
  if (!isArr(list)) {
    throw Error('First argument must be an array')
  }

  const obs = observ(list)

  each(key => {
    const fn = Array.prototype[key]
    obs[key] = function () { return fn.apply(list, arguments) }
  }, accessors)

  each(key => {
    const fn = Array.prototype[key]
    obs[key] = function () { return obs.set(list = fn.apply(list, arguments)) }
  }, pure)

  each(key => {
    const fn = Array.prototype[key]
    obs[key] = function () {
      fn.apply(list, arguments)
      return obs.set(list)
    }
  }, mutators)

  obs.change = fn => obs.set(list = fn(list))

  return obs
}

const toObserv = value => {
  if (!value || isPrimitive(value)) return observ(value)
  if (isObserv(value)) return value
  if (isArr(value)) return observArray(value)
  if (isObj(value)) {
    const listeners = []
    const keys = Object.keys(value)
    const values = Array(keys.length)
    const content = Object.create(null)
    const sendValue = each(fn => fn(value))

    let requested = true
    const getValue = () => {
      if (requested) {
        let i = -1
        requested = undefined
        value = Object.create(null)

        while (++i < keys.length) {
          value[keys[i]] = values[i]
        }
      }
      return value
    }

    const obs = fn => {
      switch (typeof fn) {
        case 'string': return content[fn]
        case 'function': {
          listeners.push(fn)
          return () => listeners && remove(listeners, fn)
        }
        default: return getValue()
      }
    }

    const requestValues = () => {
      getValue()
      sendValue(listeners)
    }

    each((key, i) => {
      const subObs = obs[key] = content[key] = toObserv(value[key])
      subObs(val => {
        values[i] = val
        requested || (requested = setTimeout(requestValues, 1))
      })
      values[i] = subObs()
    }, keys)

    obs.set = each((v, k) => content[k].set(v))

    return makeObserv(obs)
  }

  // unhandled type
  return observ(value)
}

const buildMethod = method => (...args) => {
  const obs = observ()

  method(obs.set, ...args)

  return obs
}

observ.immediate = (obs, fn) => (fn(obs()), obs(fn))
observ.check = observCheck
observ.once = observOnce
observ.from = toObserv
observ.isObserv = isObserv
observ.arr = observArray

observ.map = autoCurry((fn, obs) => {
  const newObs = observ(fn(obs()))
  obs(val => newObs.set(fn(val)))
  return newObs
})

observ.set = autoCurry((fn, obs) => {
  const setter = obs.set
  obs.set = h => setter(fn(h))
  return obs
})

observ.if = autoCurry((fn, obs) => {
  const setter = obs.set
  obs.set = h => fn(h) && setter(h)
  return obs
})

module.exports = observ
