const { isFn } = require('./is')

const regular = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\'',
}

const shifted = {
  48: ')',
  49: '!',
  50: '@',
  51: '#',
  52: '$',
  53: '%',
  54: '^',
  55: '&',
  56: '*',
  57: '(',
  186: ':',
  187: '+',
  188: '<',
  189: '_',
  190: '>',
  191: '?',
  192: '~',
  219: '{',
  220: '|',
  221: '}',
  222: '"',
}

const getAlias = (ev, which) => (ev.shiftKey ? shifted : regular)[which]
  || String.fromCharCode(which)

const applyMod = (ev, prev, fn) => fn
  ? applyMod(ev, fn, (ev.ctrlKey && fn.ctrl)
    || (ev.shiftKey && fn.shift)
    || (ev.metaKey && fn.meta)
    || (ev.altKey && fn.alt)
    || fn.none)
  : prev

module.exports = (handlers, fallback) => {
  return ev => {
    let fn = handlers[ev.key.toLowerCase()]
      || handlers[getAlias(ev, ev.which)]

    if (!fn && fallback) return fallback(ev)

    fn = applyMod(ev, fn, fn)

    if (isFn(fn)) {
      if (fn(ev) !== false) ev.preventDefault()
    } else return fallback(ev)
  }
}
