const {
  DATE_FORMAT,
  TIME_FORMAT,
  DATE_TODAY,
  DATE_YESTERDAY,
} = require('~/i18n')

const day = 24 * 60 * 60 * 1000
const yesterday = day * 2

module.exports = d => {
  if (!d || d.constructor !== Date) { d = new Date(d) }
  const delta = Date.now() - d.getTime()
  if (delta < day) return DATE_TODAY(TIME_FORMAT(d))
  return delta < yesterday
    ? DATE_YESTERDAY(TIME_FORMAT(d))
    : DATE_FORMAT(d)
}
