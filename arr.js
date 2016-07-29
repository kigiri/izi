module.exports = {
  remove: (arr, elem) => {
    if (!arr) return
    const idx = arr.indexOf(elem)
    if (idx < 0) return
    arr.splice(idx, 1)
  },
  n: n => arr => arr[n],
  first: arr => arr[0],
  append: (arr, value) => arr ? (arr.push(value), arr) : [ value ],
  prepend: (arr, value) => arr ? (arr.unshift(value), arr) : [ value ],
  last: arr => arr[arr.length - 1],
  random: arr => arr[Math.floor(Math.random() * arr.length)],
  inRange: (arr, idx) => Math.min(Math.max(idx, 0), arr.length - 1),
}
