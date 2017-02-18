module.exports = {
  text: (min, max=0) => {
    if (min > max) {
      let tmp = max
      max = min
      min = tmp
    }
    return val => val && val.constructor === String
      && val.length <= max
      && val.length >= min
  }
}
