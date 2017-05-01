const normalizePattern = /[\u0300-\u036f]/g

module.exports = str => str
  .normalize('NFD')
  .replace(normalizePattern, "")
