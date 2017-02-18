const H = Object.create.bind(Object, null)
const reduce = require('izi/collection/reduce')
const each = require('izi/collection/each')
const removeTrailingSlash = str => str[str.length - 1] === '/'
  ? str.slice(0, -1)
  : str

const ensurePath = reduce((acc, subKey) => acc[subKey] || (acc[subKey] = H()))
const last = list => list[list.length - 1]
const hasBody = method => method === 'PUT' || method === 'POST'
const toJSON = res => {
  if (res.ok) return res.json()
  const err = Error(`${res.statusText} on ${res.url}`)
  err.body = res
  err.code = err.status = res.status
  throw err
}

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

const baseReq = (url, opts) => fetch(url, opts).then(toJSON)
const buildMethod = (baseUrl, m, arg, paramsKeys) => {
  const method = m.toUpperCase()
  const handlers = []
  if (arg) {
    handlers.push((acc, arg) => acc.url = `${acc.url}/${arg}`)
  }

  if (hasBody(method)) {
    handlers.push((acc, body) => acc.opts.body = JSON.stringify(body))
  }

  if (paramsKeys && paramsKeys.length) {
    handlers.push((acc, params) => acc.url += '?'+ paramsKeys
      .map(key => params[key] && `${key}=${encodeURIComponent(params[key])}`)
      .filter(Boolean)
      .join('&'))
  }

  const applyArg = reduce((acc, arg, i) => (handlers[i](acc, arg), acc))
  return (...args) => {
    const { url, opts } = applyArg(args, {
      url: baseUrl,
      opts: { method, headers },
    })
    return fetch(url, opts).then(toJSON)
  }
}

module.exports = (endpoint, schema) => {
  endpoint = removeTrailingSlash(endpoint)
  if (!/:\/\//.test(endpoint)) {
    endpoint = `http://${endpoint}`
  }

  return reduce((acc, routeArgs, path) => {
    const methods = (typeof routeArgs === "string")
      ? ({ [routeArgs]: [] })
      : routeArgs.methods

    const keys = path.split('/').filter(Boolean)
    const lastKey = keys.pop()
    const baseUrl = `${endpoint}/${removeTrailingSlash(path)}`

    const methodKeys = Object.keys(methods)
    const endPath = ensurePath(keys, acc)
    const firstMethod = methodKeys.shift()
    const params = methods[firstMethod]
    const methodFn = buildMethod(baseUrl, firstMethod, routeArgs.arg)
    endPath[lastKey] = methodFn
    methodFn[firstMethod] = methodFn

    if (methodKeys.length) {
      each(m => {
        methodFn[m] = buildMethod(baseUrl, m, routeArgs.arg, methods[m])
      }, methodKeys)
    }

    return acc
  }, schema, H())
}

/*
console.log(module.exports('http://localhost:8500/v1', {
  'catalog/register': 'put',
  'catalog/deregister': 'put',
  'catalog/datacenters': 'get',
  'catalog/nodes': 'get',
  'catalog/services': 'get',
  'catalog/service': { methods: { get: [ 'dc', 'near' ] }, arg: 'service' },
  'catalog/node': { methods: { get: [ 'dc' ] }, arg: 'node' },
  'kv': {
    arg: 'key',
    methods: {
      get: [ 'dc', 'token', 'recurse' ],
      put: [ 'flags', 'cas', 'acquire', 'release' ],
      delete: [ 'recurse', 'cas' ],
    },
  },
}))
*/