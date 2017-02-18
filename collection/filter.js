const iter = require('./util/iter')
const magic = require('./util/magic')

const arrayOpts = {
  result: '[]',
  pre: ' ',
  post: ' && result.push(collection[key])',
}

const filter = iter({
  arr: magic('arr', arrayOpts),
  obj: magic('obj', {
    pre: ' ',
    post: '&& (result[key] = collection[key])',
  })
})

filter.toArr = iter.currify(magic('obj', arrayOpts))

module.exports = filter
