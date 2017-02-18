const map = require('izi/collection/map')
const { js } = require('./inject')
const cdnBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs'
const cdn = {}

const loadLib = map(({version, result}, name) => {
  const url = `${cdnBaseUrl}/${name}/${version}/${name}.min.js`
  return cdn[name] = js(url).then(result)
})

cdn.require = libs => Promise.all(loadLib(libs))

window.cdn = cdn

module.exports = cdn
