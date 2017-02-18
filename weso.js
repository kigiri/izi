'use strict'
const Ev = require('izi/emiter/event')
/*
const through = require('through2')
const streamCheck = stream => stream.pipe && stream.on
const wesoStream = (weso, route, format, data) => {
  if (streamCheck(data)) {
    data.pipe(through((chunck, enc, next) => {
      weso.broadcast(route + format(chunck))

      next()
    }))
  }
  else throw new Error('Need a stream')
}

*/
const defaultFormatContent = content => JSON.stringify(content)

const defaultParser = data => {
  if (!data) return {}

  const pos = data.indexOf(':')
  const route = data.slice(0, pos)

  return { route, data: JSON.parse(data.slice(pos + 1)) }
}

const checkRoute = (weso, route) => {
  if (/:/.test(route)) throw new Error('Invalid route '+ route)
}

module.exports = opts => {
  const broadcasters = {}
  const weso = Ev()
  weso.publish = {}
  //weso.streams = {}
  const formatContent = opts.formatContent || defaultFormatContent
  const parser = opts.parser || defaultParser
  const sub = opts.sub || opts.subscribe || []
  const pub = opts.pub || opts.publish || []
  //const stream = opts.str || opts.stream || []

  for (let route of sub) {
    checkRoute(weso, route)
    const ev = Ev()
    broadcasters[route] = ev.broadcast
    weso[route] = ev.listen
  }

  for (let route of pub) {
    checkRoute(weso, route)
    const prefixedRoute = route +':'
    weso.publish[route] = d => weso.broadcast(prefixedRoute + formatContent(d))
  }

/*
  for(const route of stream) {
    checkRoute(weso, route)
    const prefixedRoute = route +':'
    const ev = Ev()
    weso[route] = d => wesoStream(weso, prefixedRoute, formatContent, d)
    broadcasters[route] = ev.broadcast
    weso.streams[route] = ev.listen
  }
*/
  weso.onmessage = (data, ws) => {
    const parsed = parser(data)
    const broadcast = broadcasters[parsed.route]
    if (!broadcast) return

    parsed.ws = ws
    broadcast(parsed)
  }

  weso.link = ws => {
    for (let route of pub) {
      const prefixedRoute = route +':'
      ws.send[route] = d => ws.send(prefixedRoute + formatContent(d))
    }
  }

  return weso
}
