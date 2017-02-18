function noop() {}

module.exports = (em, handlers) => em.sub(e => (handlers[e.keyCode] || noop)(e))