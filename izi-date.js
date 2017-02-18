const parts = {
  YYYY: 'd.getFullYear()',
  YY: '("0"+(d.getFullYear() % 100)).slice(-2)',
  D: 'd.getDate()',
  M: 'd.getMonth() + 1',
  H: 'd.getHours()',
  h: 'd.getHours() % 12 || 12',
  m: 'd.getMinutes()',
  s: 'd.getSeconds()',
  S: 'String(Math.round(d.getMilliseconds() / 100)).slice(-1)',
  SS: '("0"+ Math.round(d.getMilliseconds() / 10)).slice(-2)',
  SSS: '("00"+ d.getMilliseconds()).slice(-3)',
  a: 'd.getHours() < 12 ? "am" : "pm"',
  A: 'd.getHours() < 12 ? "AM" : "PM"',
}

Object.keys(parts).forEach(key => key.length === 1
  && !parts[`${key}${key}`]
  && (parts[`${key}${key}`] = `("0"+(${parts[key]})).slice(-2)`))

const partRgx = Object.keys(parts).map(key => ({
  match: new RegExp(`\\b${key}\\b`),
  value: `$\{${parts[key]}}`,
}))

const resolveDateParts = (acc, { match, value }) => acc.replace(match, value)
const cache = Object.create(null)
module.exports = formatString => cache[formatString]
  || (cache[formatString] = Function(['d'], 'return `'+ partRgx
    .reduce(resolveDateParts, formatString) +'`'))
