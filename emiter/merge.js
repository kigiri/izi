const each = require('../collection/each')

module.exports = (setter, listenners) =>
  each((listen, key) => (listen.listen || listen)(setter), listeners)
