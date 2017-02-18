const observ = require('./emiter/observ')
const each = require('./collection/each')

function join(events) {
  const data = {}
  const grouped = observ(data)

  each((ev, key) => ev(val => {
    data[key] = val
    grouped.set(data)
  }), events)

  return grouped
}


module.exports = join
