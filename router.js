const observ = require('./emiter/observ')
const loc = window.location
const parseRoute = () => loc.hash.split('?')[0].slice(2)
const route = observ.check(parseRoute())

//handle navigation
//handle url arguments

route(hash => loc.hash = `/${hash}`)

let hash = window.location.hash
window.addEventListener('hashchange', () => route.set(parseRoute()))

const getRoute = () => hash
const setRoute = route =>
  route.set(route.split('/').filter(Boolean).join('/'))

module.exports = route
