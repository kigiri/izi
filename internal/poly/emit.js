const { isFn } = require('../../is')

module.exports = (setter, emiter, apply) => {
  if (emiter.listen) return emiter.listen(apply)

  if (isFn(emiter.set)) {
    setter(apply(emiter()))
  }

  return emiter(apply)
}
