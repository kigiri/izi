const each = require('./collection/each')
const curry = require('./auto-curry')
const { isStr, isChildren, isDef } = require('./is')
const parseTag = require('./parse-tag')

const appendChild = (elem, child) => {
  if (child === undefined) return
  if (child instanceof Element) return elem.appendChild(child)
  if (Array.isArray(child)) return child.forEach(c => appendChild(elem, c))
  return elem.appendChild(document.createTextNode(String(child)))
}

const mergePropsDefault = (a, b) => {
  if (!b) return a
  const keys = Object.keys(b)
  let i = -1
  while (++i < keys.length) {
    if (!a[keys[i]]) {
      a[keys[i]] = b[keys[i]]
    } else if (typeof a[keys[i]] === 'object') {
      mergePropsDefault(a[keys[i]], b[keys[i]])
    } else {
      a[keys[i]] = b[keys[i]]
    }
  }
  return a
}

const setAttr = (elem, val, key) => elem.setAttribute(key, val)
const assignAttr = (elem, val, key) => elem[key] = val
const deepAssignAttr = (elem, val, key) => Object.assign(elem[key], val)
const mergeCssClass = (elem, val) =>
  elem.classList.add.apply(elem.classList, val.split(' '))

// TODO: create handlers for aria and data
const getHandler = key => {
  switch (key) {
    case 'class':
    case 'className': return mergeCssClass
    case 'dataset':
    case 'style': return deepAssignAttr
    default: {
      if (key.indexOf('-') !== -1) return setAttr
      return assignAttr
    }    
  }
}

const createElement = (args, props, child) => {
  if (isChildren(props)) {
    child = props
    props = undefined
  }

  const elem = document.createElement(args.tag)

  if (props || args.props) {
    const mergeProps = each((value, key) => isDef(value)
      && getHandler(key)(elem, value, key))

    args.props && mergeProps(args.props)
    props && mergeProps(props)
  }

  appendChild(elem, child)
  return elem
}

const prepareArgs = (tag, props) => {
  if (isStr(tag)) {
    props || (props = {})
    tag = parseTag(tag, props).toLowerCase()
  } else {
    props = tag
    tag = 'div'
  }
  Object.keys(props).length || (props = undefined)
  return { tag, props }
}

const prepareStyleArgs = (tag, style) => isStr(tag)
  ? prepareArgs(tag, { style: style.style || style })
  : prepareArgs('div', { style: tag.style || tag })

const extend = (args, props) =>
  preparedH(mergePropsDefault(args, args))

const preparedH = args => {
  const create = (props, child) => createElement(args, props, child)

  create.style = (style, child) => createElement(args, { style }, child)

  create.extend = (tag, props) => extend(args, Array.isArray(tag)
    ? tag.reduce(mergePropsDefault)
    : prepareArgs(tag, props))

  create.extend.style = (tag, style) => extend(args, Array.isArray(tag)
    ? { style: tag.reduce(mergePropsDefault) }
    : prepareStyleArgs(tag, style))

  return create
}

const h = (tag, props) => preparedH(prepareArgs(tag, props))
h.style = (tag, style) => preparedH(prepareStyleArgs(tag, style))

h.appendChild = curry(appendChild)
const empty = h.empty = el => {
  if (!el) return
  while (el.lastChild && el.lastChild !== el) {
    el.removeChild(el.lastChild)
  }
}

h.replaceContent = curry((el, content) => {
  empty(el),
  appendChild(el, content)
})

h.getHandler = getHandler

module.exports = h
