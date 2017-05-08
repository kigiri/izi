const sliceFn = Array.prototype.slice
const slice = (arr, n, i) => sliceFn.call(arr, n, i)

const flattenArray = (arr, i, result) => {
  while (++i < arr.length) {
    if (Array.isArray(arr[i])) {
      flattenArray(arr[i], -1, result)
    } else {
      result.push(arr[i])
    }
  }
  return result
}

module.exports = arr => {
  let i = -1
  while (++i < arr.length) {
    if (Array.isArray(arr[i])) {
      const result = slice(arr, 0, i)
      flattenArray(arr[i], -1, result)
      return flattenArray(arr, i, result)
    }
  }
  return arr
}
