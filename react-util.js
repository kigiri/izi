const css = require('next/css').default
const { extend, spread2 } = require('./rethink')
const { isFn, isStr, isObj } = require('izi/is')
const rgx = require('./rgx')
const htmlTags = require('./html-tags')
const spread = require('lodash/spread')
const each = require('lodash/each')
const map = require('lodash/map')
const wesh = (...args) => (console.log(...args), args[args.length - 1])
const capitalize = require('lodash/capitalize')
const parseTag = require('./parse-tag')
const noOp = () => {}
const {
  Component: ReactComponent,
  createElement,
  isValidElement,
} = require('react')

const isReactComponent = comp => comp instanceof ReactComponent
const isChildren = child => {
  if (!child) return false
  switch (child.constructor) {
    case String:
    case Array: return true
    default: return isValidElement(child)
  }
}
const isPrimitive = prim => {
  if (prim === null) return null
  switch (prim.constructor) {
    case String:
    case Number:
    case Boolean: return true
    default: return false
  }
}

const knownComponents = Object.create(null)
const getKnownComponent = key => {
  if (knownComponents[key]) return knownComponents[key]
  throw Error(`Unknown component ${key}, you must add it with addComponent`)
}

const addComponent = (comp, key) => {
  if (isObj(comp)) return each(comp, addComponent)
  if (!isFn(comp) && !isReactComponent(comp)) {
    throw Error(`component ${key} is not an instance of ReactComponent`)
  }
  const k = key.toUpperCase()
  if (knownComponents[k]) {
    if (knownComponents[k] === comp) return
    throw Error(`component ${key} is already taken, choose another key`)
  }
  key = key.toLowerCase()
  knownComponents[k] = comp
  h.class[key] = comp
  h[key] || (h[key] = h.class[key])
}

const getTagAndParseProps = (cssPath, props) => {
  if (isStr(cssPath)) {
    return (cssPath[0] === '@')
      ? getKnownComponent(parseTag(cssPath.slice(1), props))
      : parseTag(cssPath, props).toLowerCase()
  }
  return cssPath
}

const mergePropsBody = (value, key) => {
  if (value === undefined) return ''
  const k = JSON.stringify(key)
  const v = isPrimitive(value) ? JSON.stringify(value) : `base[${k}]`

  return `props[${k}] === undefined && (props[${k}] = ${v});\n`
}

const mergeProps = props => Function(['props', 'base'],
  `${map(props, mergePropsBody).join('')}return props`)

const fastCloneBody = (value, key) => {
  if (value === undefined) return ''
  const k = JSON.stringify(key)
  const v = isPrimitive(value) ? JSON.stringify(value) : `base[${k}]`

  return `  ${k}: ${v},\n`
}

const fastClone = props => Function(['base'],
  `return {\n${map(props, fastCloneBody).join('')}}`)

const getClassAppender = className => {
  const appClass = ' '+ className
  return className
    ? (props => props.className && (props.className += appClass))
    : noOp
}

const __spread = spread(createElement, 2)
const newElement = (tag, props, children) => {
    if (children) {
      if (children.constructor === Array) {
        return __spread(tag, props, children)
      }
      return createElement(tag, props, children)
    }
    return createElement(tag, props)
}

const h = (tagName, baseProps={}) => {
  if (isObj(tagName)) {
    baseProps = tagName
    tagName = 'div'
  }
  if (isStr(baseProps)) {
    baseProps = { className: props }
  }
  const tag = getTagAndParseProps(tagName, baseProps)
  let merge, clone, appendCssClass

  if (!Object.keys(baseProps).length) {
    merge = clone = Object
    appendCssClass = noOp
  } else {
    merge = mergeProps(baseProps)
    clone = fastClone(baseProps)
    appendCssClass = getClassAppender(baseProps.className)
  }

  const create = (props, children) => {
    if (!props) {
      props = clone(baseProps)
    } else if (isChildren(props)) {
      children = props
      props = clone(baseProps)
    } else {
      appendCssClass(props)
      merge(props, baseProps)
    }
    return newElement(tag, props, children)
  }
  create.style = (style, children) => {
    const props = clone(baseProps)
    props.style = style
    return newElement(tag, props, children)
  }
  create.extend = props => h(tag, Object.assign({}, baseProps, props))
  return create
}

h.addComponent = addComponent
h.getKnownComponent = getKnownComponent

const deprecated = [
  'replaceState',
  'isMounted',
  'getDOMNode',
  'replaceProps',
  'setProps',
]

const component = extend(ReactComponent, deprecated)

each(htmlTags, tag => h[tag] = h(tag))

h.component = component
h.stateless = render => h(component({ render }))
h.class = Object.create(null)
h.css = css
h.h = h
h.wesh = wesh
module.exports = h
