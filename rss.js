const event = require('./emiter/event')
const parkour = require('./parkour')

module.exports = ({ id, url, selector, refreshRate = 900 }) => {
  const get = parkour.all(selector)
  const ev = event()
  let prev = []

  const update = rawNext => {
    const next = rawNext.map(id)
    const result = []
    let i = -1

    while (++i < next.length) {
      if (prev.indexOf(next[i]) === -1) {
        result.push(rawNext[i])
      }
    }

    prev = next
    if (result.length) {
      ev.broadcast(result)
    }
  }

  const triggerUpdate = () => get(url).then(update)

  setInterval(triggerUpdate, refreshRate * 1000)
  triggerUpdate()

  return ev.listen
}