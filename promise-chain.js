// ABORD ALL HOPES

const { isFn } = require('izi/is')

const delayer = timeout => {
  let _t, _r
  const d = new Promise(r => _t = setTimeout(_r = r, timeout))
  d.cancel = () => (clearTimeout(_t), _r)
  d.clear = () => _r(clearTimeout(_t))
  d.q = d
  return d
}

const noop = () => noop
module.exports = q => {
  let chain = (q && isFn(q.then) && isFn(q.catch)) ? q : Promise.resolve(q)
  let _delay = { cancel: noop, clear: noop }

  const push = (s, f) => (chain = chain.then(s, f), me)
  const clear = () => (_delay.clear(), me)
  const now = (s, f) => clear(push(s, f))

  const before = (f, delay) => {
    const resume = _delay.cancel()
    const prevChain = chain
    chain = delayer(delay || 0)
      .then(f)
      .then(() => {
        console.log('RESUMADE !')
        resume()
        return prevChain
      })
    return me
  }

  const wait = delay => (chain = chain
    .then(() => _delay = delayer(delay)), me)

  const me = { push, now, wait, clear, before }

  return me
}
