const { safe64 } = require('./number-to-base')
const rand = require('./rand')
const _pad = '0000000000000000000000000000000'
const pad = uuid => (uuid.length < 32)
  ? _pad.slice(0, 32 - uuid.length) + uuid
  : uuid

const max = Math.pow(64, 8)
module.exports = () => pad(safe64(rand(max))
  + safe64(rand(max))
  + safe64(rand(max))
  + safe64(rand(max)))

console.log(module.exports())