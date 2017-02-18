const reduce = require('izi/collection/reduce')

const build = reduce((ret, param) => {
  const spaced = param.replace(/\+/g, ' ')
  const idx = spaced.indexOf('=')
  const key = decodeURIComponent(spaced.slice(0, idx))
  const val = decodeURIComponent(spaced.slice(idx + 1))

  if (ret[key] === undefined) {
    ret[key] = val
  } else if (Array.isArray(ret[key])) {
    ret[key].push(val)
  } else {
    ret[key] = [ret[key], val]
  }
  return ret
})

module.exports = () => {
  const str = (window.location.hash || window.location.search || '')
    .split('?')[1]

  if (typeof str !== 'string' || !str) return {}

  return build(str.split('&'), Object.create(null))
}
