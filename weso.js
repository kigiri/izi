'use strict'
const Ev = require('./emiter/event')

const binary = { 
  isBinary: d => d == null || d instanceof ArrayBuffer || ArrayBuffer.isView(d),
  parseIndex: d => (new Uint8Array(d)),
  concat: (isJSON, index, data) => {
    const view = new Uint8Array(data)
    const tmp = new Uint8Array(data.byteLength + 2)
    tmp[0] = isJSON
    tmp[1] = index
    tmp.set(view, 2)
    return tmp.buffer
  },
  toString: buf => String.fromCharCode.apply(null, new Uint16Array(buf)),
  getIndex: index => new Uint16Array([ ]),
  fromString: str => {
    const buf = new ArrayBuffer(str.length * 2)
    const bufView = new Uint16Array(buf)
    let i = -1

    while (++i < str.length) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  },
}
// maybe some optimisations are possible using node Buffers


const defaultParser = buf => {
  try {
    const str = binary.toString(buf)
    return JSON.parse(binary.toString(buf))
  } catch (err) {
    console.error({ buf, err })
  }
}

const defaultEncoder = data => {
  try {
    return binary.fromString(JSON.stringify(data))
  } catch (err) {
    console.error({ data, err })
    return binary.fromString('')
  }
}

module.exports = opts => {
  const broadcasters = {}
  const weso = Ev()
  weso.publish = {}
  //weso.streams = {}
  const parser = opts.parser || defaultParser
  const encoder = opts.encoder || defaultEncoder
  const sub = opts.sub || opts.subscribe || []
  const pub = opts.pub || opts.publish || []
  const routes = sub.concat(pub).sort()
  const append = {}
  //const stream = opts.str || opts.stream || []

  for (let route of pub) {
    const index = routes.indexOf(route)
    append[route] = d => (binary.isBinary(d) || d == null)
      ? binary.concat(0, index, d || new ArrayBuffer(0))
      : binary.concat(1, index, encoder(d))
  }

  for (let route of sub) {
    const ev = Ev()
    broadcasters[route] = ev.broadcast
    weso[route] = ev.listen
  }

  for (let route of pub) {
    weso.publish[route] = d => weso.broadcast(append[route](d))
  }

  const retry = function () { weso.onmessage(this.result) }
  const binaryParser = (typeof Buffer === 'undefined')
    ? _ => _
    : _ => new Buffer(new Uint8Array(_))
  const getParser = isJSON => isJSON ? parser : binaryParser

  weso.onmessage = (rawData, ws) => {
    if (!(rawData instanceof ArrayBuffer)) {
      const fr = new FileReader()
      fr.readAsArrayBuffer(rawData)
      fr.onload = retry
      return
    }
    const [ isJSON, index ] = binary.parseIndex(rawData)
    const route = routes[index]
    const broadcast = broadcasters[route]

    if (!broadcast) return

    const data = getParser(isJSON)(rawData.slice(2))
    broadcast({ ws, route, data })
  }

  weso.link = ws => {
    for (let route of pub) {
      ws[route] = d => ws.send(append[route](d))
    }
  }

  return weso
}
