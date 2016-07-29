'use strict'
const Ev = require('geval/event')

const defaultFormatContent = content => JSON.stringify(content)

const defaultParser = data => {
  if (!data) return {}

  const pos = data.indexOf(':')
  const route = data.slice(0, pos)

  return { route, data: JSON.parse(data.slice(pos + 1)) }
}

const checkRoute = (weso, route) => {
  if (weso[route]) throw new Error('Route already reserved '+ route)
  if (/:/.test(route)) throw new Error('Invalid route '+ route)
}

module.exports = opts => {
  const broadcasters = {}
  const weso = Ev()

  const formatContent = opts.formatContent || defaultFormatContent
  const parser = opts.parser || defaultParser
  const sub = opts.sub || opts.subscribe || []
  const pub = opts.pub || opts.publish || []

  for (let route of sub) {
    checkRoute(weso, route)
    let ev = Ev()
    broadcasters[route] = ev.broadcast
    weso[route] = ev.listen
  }

  for (let route of pub) {
    checkRoute(weso, route)
    let prefixedRoute = route +':'
    weso[route] = d => weso.broadcast(prefixedRoute + formatContent(d))
  }

  weso.onmessage = (data, ws) => {
    const parsed = parser(data)
    const broadcast = broadcasters[parsed.route]
    if (!broadcast) return

    parsed.ws = ws
    broadcast(parsed)
  }

  return weso
}
