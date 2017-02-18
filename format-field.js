const each = require('izi/collection/each')

module.exports = fields => each((val, key, src) => fields[key]
  && (src[key] = fields[key](val)))
