if (typeof Set === undefined) {
  const set = () => {
    const indexCache = []
    const dataCache = Object.create(null)
    return {
      add: data => {
        indexCache.push(data)
      },
      has: (data) => indexCache.indexOf(data) !== -1
    }
  }
} else {
  module.exports = (...args) => new Set(...args)
}