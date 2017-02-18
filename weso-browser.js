const Ev = require('izi/emiter/event')
const window = require('global/window')
const initWeso = require('./weso')

const getProtocol = secure => secure ? 'wss' : 'ws'

const prepareUrl = (secure, url, port) => {
  const protocol = getProtocol(secure)

  if (port) {
    const pos = url.indexOf('/')

    return pos > 5
      ? `${protocol}://${url.slice(0, pos)}:${port}${url.slice(pos)}`
      : `${protocol}://${url}:${port}/`
  }
  return `${protocol}://${url}`
}

const init = opts => {
  if (!opts.url) throw Error('You need to specify a server url')

  const port = opts.port
  const retryDelay = opts.retryDelay
  const url = prepareUrl(opts.secure, opts.url, opts.port)

  const weso = initWeso(opts)

  const open = Ev()
  const close = Ev()
  const error = Ev()

  const connect = () => {
    const ws = new WebSocket(url)

    // Foward message send by weso
    const clear = weso.listen(content => ws.send(content))

    const assignWs = (val={}) => (val.ws = ws, val)

    // Foward message send to weso
    ws.onmessage = ({ data }) => weso.onmessage(data, ws)

    // Foward errors
    ws.onerror = err => error.broadcast(assignWs(err))

    // Cleanup on socket close
    ws.onclose = ev => {
      close.broadcast(assignWs(ev))
      clear()
      if (retryDelay) {
        setTimeout(connect, retryDelay)
      }
    }

    ws.onopen = ev => open.broadcast(ws)
  }

  weso.on = (eventType, fn) => weso[eventType](fn)

  weso.on.open = open.listen
  weso.on.close = close.listen
  weso.on.error = error.listen

  connect()

  return weso
}

module.exports = init

/*
  options :

  url: (required, ex: 'host.domain.com')
  port: 7266 (default, optional)
  secure: false (default, optional)
  retryDelay: 0 (0 = disabled, value in ms, optional)

  + all weso options
*/
