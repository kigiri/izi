
const observMap = (baseObs, fn) => {
  const obs = observ(fn(baseObs()))
  baseObs(val => obs.set(fn(val)))
  return obs
}

const observIf = (obs, fn) => {
  const setter = obs.set
  obs.set = h => fn(h) && setter(h)
  return obs
}

const observSet = (obs, fn) => {
  const setter = obs.set
  obs.set = h => setter(fn(h))
  return obs
}
