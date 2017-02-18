const rgx = require('./rgx')

const classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/
const notClassId = rgx(/^\.|#/)

module.exports = (tag, props) => {
  if (!tag) return 'div'
  
  const tagParts = tag.split(classIdSplit)
  let tagName
  
  if (notClassId(tagParts[1])) {
    tagName = 'div'
  }
  
  let classes, part, type, i
  
  for (i = 0; i < tagParts.length; i++) {
    part = tagParts[i]

    if (!part) continue

    type = part[0]

    if (!tagName) {
      tagName = part
    } else if (type === '.') {
      (classes || (classes = [])).push(part.slice(1))
    } else if (type === '#') {
      props.id || (props.id = part.slice(1))
    }
  }
  
  if (classes) {
    if (props.className) {
      classes.push(props.className)
    }
    props.className = classes.join(' ')
  }
  
  return props.namespace ? tagName : tagName
}
