const { Object: { create, hasOwnProperty } } = require('./proto')

module.exports = fn => {
  const mem = create(null)

  return k => {
    switch (typeof k) {
      case 'string':
      case 'number': return hasOwnProperty(mem, k) ? mem[k] : (mem[k] = fn(k))
      default: return fn(k)
    }
  }
}
