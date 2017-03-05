const loop = require('./loop')
const queryString = require('./query-string')
const each = require('./collection/each')
const observ = require('./emiter/observ')

// set default state values
const observables = Object.create(null)
const observablesKey = []
const observableState = observ({})

const reduceValues = () => {
  const acc = Object.create(null)
  for (let key of observablesKey) {
    acc[key] = observables[key]()
  }
  return acc
}

const trigger = loop.requester(() => 
  observableState.set(reduceValues()))

//setInterval(requester, 1000) // at least refresh every seconds

module.exports = {
  trigger,
  getCurrent: () => observableState(),
  retrieve: each((val, key) =>
    observables[key] && observables[key].set(val)),
  onChange: fn => {
    fn(observableState())
    return observableState(fn)
  },
  add: (key, baseObs) => {
    if (observables[key]) return observables[key]

    const obs = observables[key] = observ.from(baseObs)

    observablesKey.push(key)
    obs(trigger)
    trigger()

    return obs
  },
}
