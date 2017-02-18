const every = require('../collection/every')
const none = require('../collection/none')
const any = require('../collection/any')

const not = fn => (...args) => !fn(...args);

const varArgs = (args, singleArg, MultipleArgs) => args.length > 1
  ? MultipleArgs
  : singleArg

const bake = (funcs, handler) => (...args) => handler(funcs, fn => fn(...args))

const polyBake = (single, multiple) => (...tests) =>
  varArgs(tests, single, bake(multiple))

module.exports = {
  not: polyBake(not, none),
  and: (...tests) => bake(tests, every),
  or: (...tests) => bake(tests, any),
}
