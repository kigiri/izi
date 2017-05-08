const tags = require('./html-tags')
const h = require('./vanilla-h')

tags.forEach(t => h[t] === undefined && (h[t] = h(t)))

module.exports = h
