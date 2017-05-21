const { isObj, isFn } = require('./is')
const Ev = require('./emiter/event')
const fs = require('fs')
const cookie = require('cookie')
const signature = require('cookie-signature')
const initWeso = require('./weso')
const uuid = require('./uuid')
const { Server: wsServer, WebSocket: wsSocket } = require('./ws')

const deleteSession = res => res.setHeader('Set-Cookie', [ `connect.sid=` ])

const initSession = (res, secret, expiresIn, payload = {}) => {
  payload.id || (payload.id = uuid())
  payload.expiresIn = expiresIn

  const signedPayload = signature.sign(JSON.stringify(payload), secret)
  res.setHeader('Set-Cookie', cookie.serialize(`connect.sid`, signedPayload))
  return payload.id
}

const getOrInitSession = (req, res, secret, expiresIn) => {
  const session = getcookie(req.headers.cookie, secret)
  if (isObj(session)) return session
  return initSession(res, secret, expiresIn)
}

const getcookie = (cookies, secret) => {
  if (!cookies) return

  try {
    // read from cookie header
    const raw = cookie.parse(cookies)['connect.sid']
    if (!raw) return //console.error('cookie not found')
    if (raw.substr(0, 2) !== 's:') return //console.error('cookie unsigned')

    const payload = signature.unsign(raw.slice(2), secret)
    if (payload === false) return //console.error('cookie signature invalid')

    return JSON.parse(Buffer(payload, 'base64').toString())
  } catch (err) {
    console.log('error parsing cookie', err)
    return
  }
}

const dummyRequestProcessing = (req, res) => {
  res.writeHead(200)
  res.end('All glory to WebSockets!\n')
}

const init = opts => {
  const weso = initWeso(opts)
  const processRequest = opts.processRequest || dummyRequestProcessing 
  const port = opts.port || 7548
  const server = opts.server || (opts.secure
    ? require('https').createServer({
        key: fs.readFileSync(opts.secure.key),
        cert: fs.readFileSync(opts.secure.cert),
      }, processRequest)
    : require('http').createServer(processRequest))
    .listen(port, () => console.log(`Weso listening at port ${port}`))

  const wss = new wsServer({ server })

  const open = Ev()
  const close = Ev()
  const error = Ev()

  wss.on('connection', ws => {
    const session = getcookie(ws.upgradeReq.headers.cookie, opts.secret)
    if (!session) {
      if (opts.login && opts.loginRequired) {
        return ws.close(1337, 'Session is required')
      }
      ws.session = { id: ws.upgradeReq.headers['sec-websocket-key'] || uuid() }
    } else {
      ws.session = session
    }
    // Foward message send by weso
    const clear = weso.listen(content => ws.send(content))
    const wsObj = { ws }
    const assignWs = (val = {}) => (val.ws = ws, val)

    const connect = user => {
      ws.user = user
      weso.link(ws)
      ws.on('message', data => weso.onmessage(data, ws))
      open.broadcast(ws)
    }

    // Foward errors
    ws.on('error', err => error.broadcast(assignWs(err)))

    // Cleanup on socket close
    ws.on('close', code => clear(close.broadcast({ code, ws })))

    if (!isFn(opts.login)) return connect()
    opts.login(ws.session).then(connect).catch(err => {
      if (!opts.loginRequired) return connect()
      console.log(err.message, 'closing websocket')
      ws.close(1999, 'No user found in the hell gate')
    })
  })

  weso.on = (eventType, fn) => weso[eventType](fn)
  weso.on.open = open.listen
  weso.on.close = close.listen
  weso.on.error = error.listen
  weso.deleteSession = deleteSession
  weso.getSession = req => getcookie(req.headers.cookie, opts.secret)

  weso.initSession = res => 
    initSession(res, opts.secret, opts.expiresIn)

  weso.getOrInitSession = (req, res) =>
    getOrInitSession(req, res, opts.secret, opts.expiresIn)

  return weso
}

module.exports = init

/*
  options :

  url: (required, ex: 'host.domain.com')
  port: 7266 (default, optional)
  secret: 'pass phrase', // to decode the cookie
  loginRequired: true,
  login: id => db.user.getOne({ id }),
  secure: {
    key: '/path/to/you/ssl.key',
    cert: '/path/to/you/ssl.crt'
  }

  + all weso options
*/
