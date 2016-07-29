const reduce = require('./collection/reduce')

module.exports = reduce((acc, fn) => acc.then(fn))
