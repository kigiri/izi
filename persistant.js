const store = require('./global').localStorage

const fallback = _ => _
module.exports = (obs, key, parse = fallback, serialize = parse) => {
  if (store[key] !== undefined) {
    obs.set(parse(store[key]))
  } else {
    store[key] = serialize(obs())
  }
  obs(val => store[key] = serialize(val))
  return obs
}
