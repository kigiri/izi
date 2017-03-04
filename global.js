const props = k =>
  `&& ${k}.Math === Math && ${k}.Array === Array && ${k}.${k} === ${k}`

module.exports = Function([ 'global', 'window', 'self' ].map(k =>
  `if (typeof ${k} !== 'undefined' ${props(k)}) return ${k}`)
  .join('\n') + '\nreturn this || {}')()
