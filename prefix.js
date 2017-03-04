const known = [ 'moz', 'webkit', 'ms', 'o', 'khtml', 'icab' ]
const pfxs = Object.keys(window).map(key => key.split(/(^[^A-Z]+)/)[1])
const prefix = known[pfxs.reduce((p, k) => p === -1 ? known.indexOf(k) : p, -1)]
const curry = require('./auto-curry')

const getPrefixedValue = (src, key) => {
  if (src[key] !== undefined) return key
  key = `${prefix}${key[0].toUpperCase()}${key.slice(1)}`
  if (src[key] !== undefined) return key
}

module.exports = {
  get: curry((key, ctx) => ctx && ctx[getPrefixedValue(ctx, key)]),
  call: curry((key, ctx, ...args) => {
    if (!ctx) return
    const fn = ctx[getPrefixedValue(ctx, key)]
    if (!fn) {
      console.error('ctx', ctx, getPrefixedValue(ctx, key))
      throw Error(`${ctx.constructor.name}[${key}] is undefined`)
    }
    return fn.apply(ctx, args)
  }),
  cook: curry((key, ctx) => {
    const fn = ctx && ctx[getPrefixedValue(ctx, key)]
    return fn && function () { return fn.apply(ctx, arguments) }
  }),
}
