module.exports = obs => {
  let triggered = false
  const obsSafe = fn => obs.listen(val => triggered
    ? (triggered = false)
    : fn(val))
  obsSafe.set = val => obs.set(val) && (triggered = true)
  return obsSafe
}
