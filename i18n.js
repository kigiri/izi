const each = require('izi/collection/each')
const toDate = require('./izi-date')
const extractArgs = val => Array.from(new Set(val.match(/(\$[0-9])/g)))
const toGetter = val => () => val

module.exports = (definitions = {}) => {
  const locales = definitions.LOCALE

  if (!locales) {
    throw Error('you must have key LOCALE in your definitions')
  }
  if (locales.set) {
    throw Error('set is a reserved key') 
  }


  let _l = 0 // this hold the current selected locale index

  const i18n = Object.create(null)
  const keys = Object.create(null)
  const names = Object.create(null)

  const set = id => {
    if (typeof id === 'string') {
      id = keys[id] || names[id]
    }
    if (!(id < locales.length)) {
      id = 0
    }
    _l = id
  }

  locales.forEach((fullName, index) => {
    const k = fullName.slice(0, 2).toLowerCase()
    keys[k] = index
    keys[index] = k
    names[index] = names[k] = fullName
  })

  const link = (src, n, value) => src[n] = src[keys[n]] = src[names[n]] = value

  each((values, key) => {
    let len = 0
    values[len] || (values[len] = key)
    while (++len < locales.length) {
      // this sets the default value to your the value of your first locale
      // if you give an empty array, it will be filled using the key instead.
      values[len] || (values[len] = values[0])
    }

    switch (typeof values[0]) {
    case 'function': break;
    case 'string': {
      const args = extractArgs(values[0])
      if (!args.length) {
        const get = () => values[_l]
        locales.forEach((id, n) => link(get, n, toGetter(values[n])))
        i18n[key] = get
        return
      }
      // generate functions that replace $0 $1 $2... by it's arguments
      values = values.map(val => {
        if (args.length !== extractArgs(val).length) {
          throw Error(`wrong argument count in function string :\n${val}
            => expected ${args.length} but got ${extractArgs(val).length}`)
        }

        return Function(args, `return \`${val.replace(/(\$[0-9])/g, '${$1}')}\``)
      })
    } break;
    default: return;
    }

    const get = function () { return values[_l].apply(null, arguments) }
    get.use = function () { return () => values[_l].apply(null, arguments) }    
    locales.forEach((id, n) => link(get, n, values[n]))
    i18n[key] = get
  }, definitions)

  i18n.set = set

  return i18n
}