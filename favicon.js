const document = require('global/document')

const docHead = document.getElementsByTagName('head')[0]

const favicon = (mime, base64data) => {
  const newLink = document.createElement('link')

  newLink.rel = 'shortcut icon'
  newLink.href = 'data:image/' + mime + ';base64,' + base64data
  docHead.appendChild(newLink)
}

favicon.ico = base64data => favicon('x-icon', base64data)
favicon.png = base64data => favicon('png', base64data)

module.exports = favicon
