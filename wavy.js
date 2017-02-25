const { symlink, realpath } = require('./mz')('fs')
const path = require('path')
const map = require('./collection/map')
const root = __dirname.slice(0, __dirname.lastIndexOf('/node_modules/'))

const wavy = map.toArr((l, s) => {
  const link = l[0] === '/' ? l : path.resolve(root, l)
  const source = s[0] === '/' ? s : s.resolve(root, 'node_modules', s)

  return realpath(link)
    .then(real => {
      if (real && real !== source) {
        console.error(link + ' is already being used')
      }
    }, () => symlink(source, link, 'junction'))
})

module.exports = def => Promise.all(wavy(def))
