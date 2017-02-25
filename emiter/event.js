const methods = require('./methods')
const each = require('../collection/each')
const sub = require('./subscribe')

const Event = () => {
  const listeners = []
  return {
    listen: fn => sub(listeners, fn),
    broadcast: val => { each(fn => fn(val), listeners) },
  }
}

const buildMethod = method => (...args) => {
  const ev = Event()

  method(ev.broadcast, ...args)

  return ev
}

each((fn, key) => Event[key] = buildMethod(fn), methods)

module.exports = Event