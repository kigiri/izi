const range = require('lodash/range')
const unshift = require('./proto').Array.unshift
const { isFn, isObj } = require('./is')
const insanityLevel = 8

// that = fn => (...args) => fn(this, ...args)
const that = fn => function () {
  if (!arguments.length) return fn(this)
  unshift(arguments, this)
  return fn.apply(this, arguments)
}

// ary = (fn, this) => (...args) => fn(this, ...args)
const toAryArg = n => `,a${n}`
const buildArgs = n => range(n).map(toAryArg).join('')
const aryBody = range(insanityLevel)
  .map(n => `
    case ${n}: return function (${buildArgs(n).slice(1)}) {
      return fn(me${buildArgs(n)})
    }`)
  .join('')

const ary = Function(['fn', 'me'], `
  switch (fn.length) {${aryBody}
    default: return function() {
      return fn.apply(me, (unshift(args,me), args))
    }
  }
`)

// spread = (fn) => (this, args) => fn(this, ...args)
const toSpread = n => `,args[${n}]`
const spreadArgs = n => range(n).map(toSpread).join('')
const spreadBody = range(insanityLevel)
  .map(n => `
    case ${n}: return function (me, args) { return fn(me${spreadArgs(n)}) }`)
  .join('')
const spread = Function(['fn'], `
  switch (fn.length) {${spreadBody}
    default: return function (me, args) {
      unshift(args, me)
      return fn.apply(me, args)
    }
  }
`)

// spread = (fn) => (this, super, args) => fn(this, super, ...args)
const spreadBody2 = range(insanityLevel)
  .map(n => `
    case ${n}: return function (me, supr) {
      return fn(me,supr${spreadArgs(n)})
    }`)
  .join('')
const spread2 = Function(['fn'], `
  switch (fn.length) {${spreadBody}
    default: return function (me,supr,args) {
      unshift(args, supr)
      unshift(args, me)
      return fn.apply(me, args)
    }
  }
`)

const autoSuper = (_super, bindProto, constructor) => {
  if (!constructor) {
    return function Class() {
      _super.apply(this, arguments)
      this && bindProto(this)
    }
  }
  const callConstructor = spread(constructor)
  return function Class() {
    _super.apply(this, arguments)
    callConstructor(this, _super, arguments)
    this && bindProto(this)
  }
}

const manualSuper = (_super, bindProto, constructor) => {
  if (!constructor) return function Class() { this && bindProto(this) }
  const callConstructor = spread2(constructor, _super)
  return function Class() {
    callConstructor(this, arguments)
    this && bindProto(this)
  }
}

const extend = (Class, blacklist = []) => {
  const classProto = Class.prototype

  const baseKeys = Object.keys(Class)
    .filter(key => isFn(Class[key]))

  const protoKeys = Object.getOwnPropertyNames(classProto)
    .filter(key => (blacklist.indexOf(key) === -1)
      && isFn(classProto[key]))
  
  const _extend = getClass => (constructor, methods, statics) => {
    if (isObj(constructor)) {
      statics = methods
      methods = constructor
      constructor = undefined
    }

    methods || (methods = {})
    statics || (statics = {})

    const bindProto = Function(['ary', 'methods', 'me'], Object.keys(methods)
      .map(key => `me.${key}=ary(methods.${key}.apply.bind(methods.${key}),me)`)
      .join(';\n')).bind(undefined, ary, methods)

    const Component = Object
      .assign(getClass(Class, bindProto, constructor), statics)
    Component.prototype = Object.create(classProto)

    return Component
  }

  const manual = _extend(manualSuper)
  manual.super = _extend(autoSuper)

  return manual
}

module.exports = {
  spread2,
  spread,
  extend,
  that,
  ary,
}
