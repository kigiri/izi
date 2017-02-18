const slice = Array.prototype.slice.call.bind(Array.prototype.slice)


const flattenArray = (arr, result) => {
  let i = -1
  while (++i < arr.length) {
    if (Array.isArray(arr[i])) {
      if (!result) {
        result = slice(arr, 0, i)
      }
      flattenArray(arr[i], result)
    } else {
      result && result.push(arr[i])
    }
  }
  return result || arr
}

module.exports = a => flattenArray(a, [])
