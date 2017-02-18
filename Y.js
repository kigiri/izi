/*
const id = fn => fn(fn)
const Y = caller =>
  id(fn => caller((...args) => fn(fn)(...args)))
*/

// Not really a Y combinator but can be used as such
// with close to no performance costs
module.exports = f => {
  const fn = f(function () { return fn.apply(null, arguments) })
  return fn
}
