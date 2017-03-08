const each = require('./collection/each')
const { isStr, isChildren, isDef } = require('./is')
const parseTag = require('./parse-tag')

const appendChild = (elem, child) => {
  if (!child) return
  if (child instanceof Element) return elem.appendChild(child)
  if (Array.isArray(child)) return child.forEach(c => appendChild(elem, c))
  return elem.appendChild(document.createTextNode(String(child)))
}

const setAttr = (elem, val, key) => elem.setAttribute(key, val)
const assignAttr = (elem, val, key) => elem[key] = val
const deepAssignAttr = (elem, val, key) => Object.assign(elem[key], val)
const mergeCssClass = (elem, val) =>
  elem.classList.add.apply(elem.classList, val.split(' '))

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

const h = (tag, defaultProps) => {
  if (isStr(tag)) {
    defaultProps || (defaultProps = {})
    tag = parseTag(tag, defaultProps).toLowerCase()
  } else {
    defaultProps = tag
    tag = 'div'
  }

  Object.keys(defaultProps).length || (defaultProps = undefined)

  return (props, child) => {
    if (isChildren(props)) {
      child = props
      props = undefined
    }

    const elem = document.createElement(tag)

    if (props || defaultProps) {
      const mergeProps = each((value, key) => isDef(value)
        && getHandler(key)(elem, value, key))

      defaultProps && mergeProps(defaultProps)
      props && mergeProps(props)
    }

    appendChild(elem, child)
    return elem
  }
}

let _proxy
Object.defineProperty(h, 'proxy', {
  get: () => _proxy || (_proxy = new Proxy(Object.create(null), {
    get: (src, tag) => src[tag] || (src[tag] = h(tag)),
  })),
})

h.appendChild = appendChild
const empty = h.empty = el => {
  if (!el) return
  while (el.lastChild) {
    el.removeChild(el.lastChild)
  }
}

h.replaceContent = (el, content) => {
  empty(el),
  appendChild(el, content)
}

module.exports = h