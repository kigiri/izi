const test = require('blue-tape')
const parkour = require('../parkour')

const google = parkour.all.text('a')

google('https://www.google.fr')
  .then(console.log)
  .catch(console.dir)
