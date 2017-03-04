const range = (start, end) => {
  if (end === undefined) {
    end = start
    start = 0
  }
  const max = end - start
  const ret = Array(max)
  let i = -1

  while (++i <= max) {
    ret[i] = start++
  }
  return ret
}
range.from = n => end => range(n, end)

module.exports = {
  range,
  remove: (arr, elem) => {
    if (!arr) return
    const idx = arr.indexOf(elem)
    if (idx < 0) return
    arr.splice(idx, 1)
  },
  n: n => arr => arr[n],
  shuffle: arr => {
    let i = arr.length
    let j, tmp
    while (--i > 0) {
      j = Math.floor(Math.random() * (i + 1))
      tmp = arr[j]
      arr[j] = arr[i]
      arr[i] = tmp
    }
    return arr
  },
  first: arr => arr[0],
  append: (arr, value) => arr ? (arr.push(value), arr) : [ value ],
  prepend: (arr, value) => arr ? (arr.unshift(value), arr) : [ value ],
  last: arr => arr[arr.length - 1],
  unique: arr => Array.from(new Set(arr)),
  random: arr => arr[Math.floor(Math.random() * arr.length)],
  inRange: (arr, idx) => Math.min(Math.max(idx, 0), arr.length - 1),
}

Object.getOwnPropertyNames(Array.prototype)
  .filter(method => typeof Array.prototype[method] === 'function')
  .forEach(method => {
    const fn = Array.prototype[method]
    module.exports[method] = function() {
      return arr => fn.apply(arr, arguments)
    }
  })
