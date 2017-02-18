const document = require('global/document')
const scrollBar = { size: 16 }
const scrollBox = document.createElement('div')

if (scrollBox.getBoundingClientRect) {
  scrollBox.style.visibility = "hidden"
  scrollBox.style.overflowX = "scroll"
  document.body.appendChild(scrollBox)
  scrollBar.size = scrollBox.getBoundingClientRect().height
  document.body.removeChild(scrollBox)
}

module.exports = scrollBar
