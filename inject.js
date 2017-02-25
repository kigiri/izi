const reduce = require('./collection/reduce')

const loader = (urlKey, tag, typeKey, type) => {
  const isHere = reduce((url, elem) =>
    url && (elem[urlKey].indexOf(url) === -1 ? url : false))

  const checkPresence = url =>
    isHere(document.body.getElementsByTagName(tag), url)

  const errorHanlder = (url, reject) => event => {
    const err = new Error(`Error loading ${type} `+ url)
    err.event = event
    reject(err)
  }

  return url => {
    if (!checkPresence(url)) {
      return Promise.reject(new Error(`${type} ${url} already injected`))
    }
    const elem = document.createElement(tag)
    const p = new Promise((resolve, reject) => {
      elem.onerror = errorHanlder(url, reject)
      elem.onload = resolve
    })

    elem[typeKey] = type
    elem[urlKey] = url
    document.body.appendChild(elem)

    return p
  }
}

module.exports = {
  css: loader('href', 'link', 'rel', 'stylesheet'),
  js: loader('src', 'script', 'type', 'text/javascript'),
}