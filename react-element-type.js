const type = (typeof Symbol === 'function'
  && Symbol.for
  && Symbol.for('react.element')) || 0xeac7

const key = '$$typeof'

module.exports = {
  key,
  type,
  get: obj => obj[key],
  set: obj => obj[key] = type,
  is: obj => obj[key] === type,
}
