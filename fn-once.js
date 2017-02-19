module.exports = fn => {
  let called = false

  return function () {
    return called || (called = true, fn.call(null, arguments))
  }
}