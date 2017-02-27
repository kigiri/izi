const window = require('global/window')
const _vTypes = {
  VirtualText: true,
  Thunk: true,
  VirtualNode: true,
  Widget: true,
}

const isFn = fn => typeof fn === 'function'
const isArr = Array.isArray || (arr => arr && arr.constructor === Array)
const isDef = val => val !== undefined
const isNum = num => typeof num === 'number' && !isNaN(num)
const isBool = b => b === true || b === false
const isObj = obj =>
  obj && (obj.constructor === Object || obj.constructor === undefined)
const isStr = str => typeof str === 'string'
const isUndef = val => val === undefined
const isThenable = fn => fn && isFn(fn.then)
const isPromise = fn => isThenable(fn) && isFn(fn.catch)
const isChild = x => x && _vTypes[x.type]
const isChildren = x => isStr(x) || isArr(x) || isChild(x)
const isObserv = obs => isFn(obs) && isFn(obs.set)
const isEvent = ev => isFn(ev.listen) && isFn(ev.broadcast)
const isHook = hook => hook &&
  (isFn(hook.hook) && !hook.hasOwnProperty("hook")
  || isFn(hook.unhook) && !hook.hasOwnProperty("unhook"))

const isPrimitive = prim => {
  switch (typeof prim) {
    case 'string':
    case 'number':
    case 'boolean': return true
    default: return false
  }
}

const isNode = typeof window !== 'undefined'
const isFloat = (float => isNum(float) && Math.floor(float) !== float)
const isInt = Number.isInteger || (int => isNum(int) && Math.floor(int) === int)

const is = {
  isFn,
  isArr,
  isDef,
  isInt,
  isStr,
  isObj,
  isNum,
  isBool,
  isNode,
  isUndef,
  isFloat,
  isChild,
  isHook,
  isEvent,
  isObserv,
  isPromise,
  isChildren,
  isPrimitive,
  isThenable,
}

Object.keys(is).forEach(key => is[key.slice(2).toLowerCase()] = is[key])

module.exports = is