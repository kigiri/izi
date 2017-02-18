const { symlink, realpath } = require('./mz')('fs')
const path = require('path')
const map = require('izi/collection/map')
const root = path.resolve(__dirname, '../')
  // = dirname.slice(0, dirname.lastIndexOf('/node_modules/'));

const wavy = map.toArr((l, s) => {
  const link = path.resolve(root, l)
  const source = path.resolve(root, 'node_modules', s)

  return realpath(link)
    .then(real => {
      if (real && real !== source) {
        console.error(link + ' is already being used')
      }
    }, () => symlink(source, link, 'junction'))
})

module.exports = def => Promise.all(wavy(def))
