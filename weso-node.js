const Ev = require('./emiter/event')
const fs = require('fs')
const signature = require('cookie-signature')
const cookie = require('cookie')
const initWeso = require('./weso')
const uws = require('uws')
const wsServer = uws.Server
const wsSocket = uws.WebSocket

const getcookie = (cookies, secret) => {
  if (!cookies) return

  // read from cookie header
  const raw = cookie.parse(cookies)['connect.sid']

  if (!raw) return console.log('cookie not found')
  if (raw.substr(0, 2) !== 's:') return console.log('cookie unsigned')

  const val = signature.unsign(raw.slice(2), secret)

  if (val === false) return console.log('cookie signature invalid')

  return val
}

// dummy request processing
const processRequest = (req, res) => {
  res.writeHead(200)
  res.end("All glory to WebSockets!\n")
}

const init = opts => {
  const weso = initWeso(opts)
  const server = (opts.secure
    ? require('https').createServer({
        key: fs.readFileSync(opts.secure.key),
        cert: fs.readFileSync(opts.secure.cert),
      }, processRequest)
    : require('http').createServer(processRequest))
    .listen(opts.port)

  const wss = new wsServer({ server })

  const open = Ev()
  const close = Ev()
  const error = Ev()

  wss.on('connection', ws => {
    const id = getcookie(ws.upgradeReq.headers.cookie, opts.secret)
    if (!id) return ws.close(1337, 'Session not set')
    // Foward message send by weso
    const clear = weso.listen(content => ws.send(content))
    ws.id = id
    const wsObj = { ws }
    const assignWs = (val={}) => (val.ws = ws, val)

    const connect = user => {
      weso.link(ws)
      ws.user = user
      ws.on('message', data => weso.onmessage(data, ws))
      open.broadcast(ws)
    }

    // Foward errors
    ws.on('error', err => error.broadcast(assignWs(err)))

    // Cleanup on socket close
    ws.on('close', code => clear(close.broadcast({ code, ws })))

    if (opts.login) {
      opts.login(id).then(connect).catch(err => {
        console.log(err.message, 'closing websocket')
        ws.close(1999, 'No user found in the hell gate')
      })
    } else {
      connect()
    }
  })

  weso.on = (eventType, fn) => weso[eventType](fn)

  weso.on.open = open.listen
  weso.on.close = close.listen
  weso.on.error = error.listen

  return weso
}

module.exports = init

/*
  options :

  url: (required, ex: 'host.domain.com')
  port: 7266 (default, optional)
  secret: 'pass phrase', // to decode the cookie
  login: id => db.user.getOne({ id }),
  secure: {
    key: '/path/to/you/ssl.key',
    cert: '/path/to/you/ssl.crt'
  }

  + all weso options
*/
