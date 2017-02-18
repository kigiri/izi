const each = require('izi/collection/each')
const merge = require('lodash/merge')
const methods = require('izi/emiter/methods')
const remove = require('izi/arr').remove

const noOp = _ => _
module.exports = (id, map=noOp) => {
  const value = Object.create(null)
  const listeners = []
  const call = each(fn => fn(mappedValue))
  const mergeValue = each(msg => value[msg[id]] = msg)

  let mappedValue = map(value)

  const subscriber = fn => {
    if (typeof fn !== 'function') return mappedValue
    listeners.push(fn)
    return () => listeners && remove(listeners, fn)
  }

  const refresh = _ => (mappedValue = map(value), call(listeners), _)
  subscriber.set = val => refresh(mergeValue(val))
  subscriber.push = val => refresh(value[val[id]] = val)
  subscriber.merge = (id, val) => refresh(value[id] = merge({}, value[id], val))

  return subscriber
}
