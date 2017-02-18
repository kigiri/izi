const loop = require('../lib/loop')
const queryString = require('../lib/query-string')
const each = require('izi/collection/each')
const clamp = require('lodash/clamp')
const observ = require('izi/emiter/observ')
const isPrimitive = require('./is-primitive')

// set default state values
const observables = Object.create(null)
const observablesKey = []
const observableState = observ({})

const reduceValues = () => {
  const acc = {}
  for (let key of observablesKey) {
    acc[key] = observables[key]()
  }
  return acc
}

const requester = loop.requester(() => 
  observableState.set(reduceValues()))

//setInterval(requester, 1000) // at least refresh every seconds

module.exports = {
  getCurrent: () => observableState(),
  retrieve: each((val, key) =>
    observables[key] && observables[key].set(val)),
  onChange: fn => {
    fn(observableState())
    return observableState(fn)
  },
  add: (key, obs) => {
    if (!obs || isPrimitive(obs)) {
      obs = observ(obs)
    }
    if (observables[key]) return
    observables[key] = obs
    observablesKey.push(key)
    obs(requester)
    requester()
    return obs
  },
  trigger: requester,
}
