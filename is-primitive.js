module.exports = prim => {
  if (prim === null) return null
  switch (prim.constructor) {
    case String:
    case Number:
    case Boolean: return true
    default: return false
  }
}
