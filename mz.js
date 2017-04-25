// my take on a lazy modernize using proxy

const promisify = fn => typeof fn === 'function'
  ? (...args) => new Promise((s, f) => fn(...args, (e, r) => e ? f(e) : s(r)))
  : fn

const proxify = fn => obj => new Proxy(Object.create(null),
  { get: (cache, key) => cache[key] || (cache[key] = fn(obj[key])) })

const deepProxy = proxify(promisify)

module.exports = mod => deepProxy(typeof mod === 'string' ? require(mod) : mod)
module.exports.promisify = promisify