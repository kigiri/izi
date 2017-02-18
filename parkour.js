const CSSselect = require('css-select')
const request = require('request-promise-native')
const each = require('./collection/each')
const map = require('./collection/map')
const iHateOOP = require('html-entities')
const { DomHandler, Parser } = require('htmlparser2')
const ElementType = require("domelementtype")
const getOuterHTML = require("dom-serializer")

const { decode } = new iHateOOP.AllHtmlEntities()
const isTag = ElementType.isTag
const parserOpts = {
//  normalizeWhitespace: true
}
const rqOpts = {
  simple: true,
  encoding: 'binary',
}

const getText = el => {
  if (isTag(el)) return el.name === 'br' ? '\n' : getTextJoin(el.children);
  if (el.type === ElementType.CDATA) return getTextJoin(el.children);
  if (el.type === ElementType.Text) return el.data;
  return "";
}
const mapGetText = map(getText)
const getTextJoin = els => mapGetText(els).join('')

const toTextStr = el => decode(getText(el)).trim()
const allToText = map(toTextStr)
const toText = el => Array.isArray(el)
  ? allToText(el)
  : toTextStr(el)

const textify = el => el.textContent
  || Object.defineProperty(el, 'textContent', { get: () => toTextStr(el) })

const expand = el => {
  while (el) {
    console.log(el)
    textify(el)
    if (el.children) {
      expandAll(el.children)
    }
    el = el.next
  }
  return el
}
const expandAll = each(expand)
const compileAll = map(q => CSSselect.compile(q))
const prepareQuery = (key, selector) => {
  if (typeof selector === 'string') {
    const query = CSSselect.compile(selector)
    return dom => CSSselect[key](query, dom)
  }
  const selectors = compileAll(selector)
  return dom => map(query => CSSselect[key](query, dom), selectors)
}

const parkourFactory = key => selector => {
  const query = prepareQuery(key, selector)

  return (uri, opts = {}) => request(Object.assign({ uri }, opts, rqOpts))
    .then(body => new Promise((s, f) => {
      const p = new Parser(new DomHandler((err, dom) => {
        if (err) return f(err)

        const res = query(dom)
        return res
          ? s(res)
          : f(Object.assign(Error(`${selector} not found for ${opts.uri}`),
            { opts, body, dom }))
      }), parserOpts)
      p.write(body)
      p.done()
    }))
}

const wrap = (action, handler) => selector => {
  const fn = action(selector)
  return (a, b) => fn(a, b).then(handler)
}

const get = parkourFactory('selectOne')
get.all = parkourFactory('selectAll')


const $ = key => (selector, ...args) => {
  const query = CSSselect.compile(selector)
  return (args.length)
    ? CSSselect[key](query, ...args)
    : (...subArgs) => CSSselect[key](query, ...subArgs)
}

// Proxy magic
const proxify = (_$, acc = [], cache) => {
  cache || (cache = Object.create(null))
  const get = sep => {
    const selector = acc.join(typeof sep === 'string' ? sep : ' ')
    const query = cache[selector] || (cache[selector] = _$(selector))
    return (sep && (typeof sep === 'object'))
      ? query(sep)
      : query
  }
  const proto = get.__proto__
  get.__proto__ = new Proxy(cache, {
    get: (_, key) => typeof key === 'string'
      && proxify(_$, acc.concat([key]), cache),
  })

  return get
}

module.exports = wrap(get, expand)

module.exports.$ = proxify($('selectOne'))
module.exports.$$ = proxify($('selectAll'))
module.exports.all = wrap(get.all, expandAll)
module.exports.text = wrap(get, toText)
module.exports.all.text = wrap(get.all, map(toText))

module.exports.toText = toText
module.exports.raw = get
module.exports.wrap = wrap
