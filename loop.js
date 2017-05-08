const raf = require('raf')
const ev = require('./emiter/event')
const each = require('./collection/each')
const once =  require('./once')
const remove = require('./arr').remove

const loop = ev()
const after = ev()
const before = ev()
const often = ev()

raf((prevT => function recur(t) {
  before.broadcast(t)
  loop.broadcast(t)
  after.broadcast(t)
  if (t - prevT > 500) {
    often.broadcast(t)
    prevT = t
  }
  raf(recur)
})(0))

// loop.before should never be used to morph the dom
loop.listen.before = before.listen
loop.listen.after = after.listen
loop.listen.often = often.listen // triggered every 500ms

const callAll = each(fn => fn())
const callRequested = each(fn => {
  if (fn.$$requested) {
    fn.$$requested = false
    fn()
  }
})

let request = false
let oneShotListenners = []
const listeners = []

loop.listen(() => {
  if (request) {
    callAll(oneShotListenners)
    request = false
    oneShotListenners = []
  }
  callRequested(listeners)
})

loop.listen.requester = fn => {
  const requester = () => fn.$$requested = true
  listeners.push(fn)
  requester.remove = once(() => remove(listeners, fn))
  return requester
}

loop.listen.next = fn => {
  request = true
  oneShotListenners.push(fn)
}

module.exports = loop.listen
