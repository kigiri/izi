const each = require('./collection/each')

module.exports = (proto, state) => {
  each(key => state[key] = proto[key].bind(null, state), proto)
  return state
}
