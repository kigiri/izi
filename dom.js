const getParentById = (node, id) => {
  while (node) {
    if (node.id === id) return node
    node = node.parentNode
  }
}

const getParentByData = (node, key, value) => {
  while (node) {
    if (node.dataset[key] === value) return node
    node = node.parentNode
  }
}

module.exports = {
  getParentById,
  getParentByData,
}
