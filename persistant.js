const store = require('global/window').localStorage

const fallback = _ => _
module.exports = (obs, key) => {
  if (store[key] !== undefined) {
    obs.set(store[key])
  }
  obs(val => store[key] = val)
}
