const sub = require('./subscribe')
const each = require('../collection/each')
const methods = require('./methods')

const Observ = value => {
  const listeners = []
  const subscriber = fn => sub(listeners, fn, value)

  subscriber.set = val => {
    value = val
    each(fn => fn(val), listeners)
  }

  return subscriber
}

const defaultCheck = (a, b) => a !== b
const ObservCheck = (value, check) => {
  const listeners = []
  check || (check = defaultCheck)
  const subscriber = fn => sub(listeners, fn, value)

  subscriber.set = val => {
    if (!check(val, value)) return
    value = val
    each(fn => fn(val), listeners)
  }

  subscriber.setCheck = newCheck => check = newCheck

  return subscriber
}

const ObservOnce = () => {
  let listeners = []
  const subscriber = fn => sub(listeners, fn)

  subscriber.set = val => {
    if (!listeners) return console.warn('trigger a once multiple times')
    each(fn => fn(val), listeners)
    listeners = subscriber.set = null
  }

  return subscriber
}

Observ.check = ObservCheck
Observ.once = ObservOnce

const buildMethod = method => (...args) => {
  const obs = Observ()

  method(obs.set, ...args)

  return obs
}

each((fn, key) => Observ[key] = buildMethod(fn), methods)

const immediate = (obs, fn) => {
  fn(obs())
  return obs(fn)
}

Observ.immediate = immediate

module.exports = Observ
