// my take on a lazy modernize using proxy

const proxify = fn => obj => new Proxy(Object.create(null),
  { get: (cache, key) => cache[key] || (cache[key] = fn(obj[key])) })

const deepProxy = proxify(fn => typeof fn === 'function'
  ? (...args) => new Promise((s, f) => fn(...args, (e, r) => e ? f(e) : s(r)))
  : fn)

module.exports = key => deepProxy(require(key))
