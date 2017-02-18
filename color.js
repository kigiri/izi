const memoize = require('lodash/memoize')
const range = require('lodash/range')
const clamp = require('lodash/clamp')
const { getLuminance } = require('./lum')

const hsl = (h=0,s=100,l=50) =>
  `hsl(${h}, ${s}%, ${l}%)`

const rotate = (l, v) => l > 0.33
  ? ((l * 100 - 50))
  : (66 + (l * 100))

const getColorShade = memoize((h,s,i) => {
  const l = ((i+1)/7) * 100
  const background = hsl(h, s, l)
  const color = hsl(h, s, rotate(getLuminance(h,s,l), l))
  const primary = { background, color }
  const secondary = { background: color, color: background }
  return {
    primary,
    secondary,
  }
}, (h,s,i) => `h${h}s${s}i${i}`)

const getColorRange = (h, s) => range(6).map((src, i) => getColorShade(h,s,i))

module.exports = {
  hsl,
  getColorShade,
  getColorRange,
}
