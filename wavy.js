const { symlink, realpath } = require('./mz')('fs')
const path = require('path')
const map = require('./collection/map')

module.exports = (def, root) => {
  root || (root = __dirname.slice(0, __dirname.lastIndexOf('/node_modules/')))
  const wavy = map.toArr((l, s) => {
    const link = l[0] === '/' ? l : path.resolve(root, l)
    const source = s[0] === '/' ? s : path.resolve(root, 'node_modules', s)

    const logOutput = () =>
      console.log(`${source.slice(source.lastIndexOf('node_modules/')+13)} -> ${link}`)

    return symlink(link, source, 'junction')
      .then(logOutput)
      .catch(err => {
        if (err.code === 'EEXIST') return logOutput()
        throw err
      })
  })
  return Promise.all(wavy(def))
}

