const { isObj, isFn } = require('./is')
const Ev = require('./emiter/event')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const initWeso = require('./weso')
const uuid = require('./uuid')
const { Server: wsServer, WebSocket: wsSocket } = require('./ws')

const deleteSession = res => res.setHeader('Set-Cookie', [ `token=` ])
const setSession = (res, data, secret, expiresIn='15d') => res
  .setHeader('Set-Cookie', [ `token=${jwt.sign(data, secret, { expiresIn })}` ])

const initSession = (res, data, secret, expiresIn) => {
  data.id || (data.id = uuid())
  setSession(res, data, secret, expiresIn)
  return data
}

const getOrInitSession = (req, res, data, secret, expiresIn) => {
  const session = getcookie(req.headers.cookie, secret)
  if (isObj(session)) return session
  return initSession(res, data, secret, expiresIn)
}

const getcookie = (cookies, secret) => {
  if (!cookies) return

  // read from cookie header
  const { token } = cookie.parse(cookies)

  if (!token) return
  try { return jwt.verify(token, secret) }
  catch (err) {}
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
      if (opts.login) {
        return ws.close(1337, 'Session is required')
      }
      ws.session = { id: ws.upgradeReq.headers['sec-websocket-key'] || uuid() }
    } else {
      ws.session = session
    }
    // Foward message send by weso
    const clear = weso.listen(content => ws.send(content))
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

    if (isFn(opts.login)) {
      opts.login(ws.session.id).then(connect).catch(err => {
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
  weso.deleteSession = deleteSession
  weso.getSession = req => getcookie(req.headers.cookie, opts.secret)

  weso.setSession = (res, data) =>
    setSession(res, data, opts.secret, opts.expiresIn)

  weso.initSession = (res, data={}) => 
    initSession(res, data, opts.secret, opts.expiresIn)

  weso.getOrInitSession = (req, res, data={}) =>
    getOrInitSession(req, res, data, opts.secret, opts.expiresIn)

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
