const S = require('./proto').String
const { isFn } = require('./is')
const map = require('./collection/map')
const curry = require('./auto-curry')

// generate usefull cookers
Object.keys(S).forEach(method => {
  const fn = String.prototype[method]
  isFn(fn) && ((exports[method] = S[method]).cook = function() {
    return str => fn.apply(str, arguments)
  })
})

// str utils
const firstLetter = /^./
const charFollowingDelimitors = /[-_. ]+(.)/
const consecutiveSpaces = /\s\s/
const whiteSpace = /\s/
const wordStop = /[^A-Za-z-_]/
const reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g
const reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g
const toUpper = S.toUpperCase
const toLower = S.toLowerCase
const deburredLetters = Object.assign(Object.create(null), {
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
})

const deburrLetter = letter => deburredLetters[letter]
const deburr = str => str.replace(reLatin1, deburrLetter)

const matches = {
  firstLetter,
  charFollowingDelimitors,
  consecutiveSpaces,
  whiteSpace,
  wordStop,
  reLatin1,
  reComboMark,
}

const test = match => str => match.test(str)
test.not = match => str => !match.test(str)

const tests = map(test, matches)
tests.not = map(test.not, tests)

const cut = curry((startPattern, endPattern, str) => {
  const start = str.indexOf(startPattern)
  const end = str.indexOf(endPattern)
  return (end === -1) ? str.slice(start) : str.slice(start, end)
})
cut.before = curry((pattern, str) => str.slice((str.indexOf(pattern))))
cut.after = curry((pattern, str) => {
  const idx = str.indexOf(pattern)
  return (idx === -1) ? str : str.slice(0, idx)
})

const cleanup = str => str.trim().replace(consecutiveSpaces, dashize)
const dashize = str => `-${toLower(str)}`
const replaceBy = curry((value, match, str) => str.replace(match, value))
const replace = curry((match, value, str) => str.replace(match, value))
replace.getFirstGroup = fn => (_, a) => fn(a)
const remove = replaceBy('')
const splitAlphaNum = exports.split.cook(/[^0-9A-Za-z]+/)
const toWords = str => splitAlphaNum(deburr(str))

Object.assign(exports, {
  cut,
  test,
  tests,
  deburr,
  matches,
  toUpper,
  toLower,
  cleanup,
  toWords,
  remove,
  insert: (str, idx, value) => str.slice(0, idx) + value + str.slice(idx),
  toCamel: replace(charFollowingDelimitors, replace.getFirstGroup(toUpper)),
  toSnake: replace(/[A-Z]/, dashize),
  normalize: str => toWords.join(' '),
  capitalize: replace(firstLetter, toUpper),
  decapitalize: replace(firstLetter, toLower),
  extract: curry((rgx, str) => str.split(rgx)[1]),
})
