const { Object: { create, hasOwnProperty } } = require('./proto')

module.exports = (fn, id) => {
  const mem = create(null)

  return function () {
    const k = id ? id.apply(this, arguments) : arguments[0]
    switch (typeof k) {
      case 'string':
      case 'number': return hasOwnProperty(mem, k) ? mem[k] : (mem[k] = fn(k))
      default: return fn.apply(this, arguments)
    }
  }
}
