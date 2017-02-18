const flatten = require('./flatten')
const filter = require('./collection/filter')
const map = require('./collection/map')

const isFn = fn => typeof fn === 'function'
const thennable = val => val && isFn(val.then)
const filterFn = filter(isFn)
const start = Promise.resolve()
const toPromise = q => thenable(q) ? q : Promise.resolve(q)
const toBody = (i, str) => i > -1 ? `this[${i}](${toBody(i - 1, str)})` : str
const execAll = map(fn => isFn(fn) ? fn() : fn)

const fnCache = Object.create(null)
const getBaseFn = size => fnCache[size]
  || (fnCache[size] = Function(['_'], 'return '+ toBody(size - 1, '_')))

// encapsulate iterator state
const counter = (max, n = -1) => () => ++n >= max ? undefined : n

// give it an array and it returns a function that iter through each values
const poller = arr => {
  const c = counter(arr.length)
  return () => arr[c()]
}

const arrReverse = Array.prototype.reverse.call.bind(Array.prototype.reverse)
const reverse = f => (...args) => f(arrReverse(flatten(args)))
const onlyFn = f => (...args) => {
  const fns = filterFn(flatten(args))
  if (fns.length < 1) {
    throw Error('flow need at least a function')
  }
  return f(fns)
}

// process the promises batch
const getWorker = ({ fns, getNextKey, result }) => function worker() {
  const key = getNextKey()
  if (!key) return
  const q = fns[key]()

  return thennable(q)
    ? q.then(val => worker(result[key] = val))
    : worker(result[key] = val)
}

// this build the specifics tools for telling the worker
// how to resolve and  
const prepWorker = fns => Array.isArray(fns)
  ? {
      fns,
      result: Array(fns.length),
      getNextKey: counter(fns.length),
    }
  : {
      fns,
      result: Object.create(null),
      getNextKey: poller(Object.keys(fns)),
    }


// Execute a collection of promise in series
// can be "paralelized" if you specify "count"
const serie = (fns, count) => {
  const prepData = prepWorker(fns)

  if (!count || count < 2) return getWorker(prepData)

  const channels = Array(count)
  while (--count >= 0) {
    channels[count] = getWorker(prepData)
  }

  return Promise.all(channels).then(() => prepData.result)
}

// Store chain recursive constructor
const C = (store, ref) => ({
  then: (s, f) => C(store, ref.then(s, isFn(f) && (err => f(err, store)))),
  catch: f => C(store, isFn(f)
    ? ref.catch(err => f(err, store))
    : ref),
  set: key => C(store, ref.then(value => store[key] = value)),
  del: key => C(store, ref.then(key => store[key] = undefined)),
  get: (s, f) => C(store, ref.then(isFn(s) && (() => s(store)),
    isFn(f) && (err => f(err, store)))),
  toPromise: () => ref,
})

// Promise.all for objects
const objectPromiseAll = (obj, store) => {
  store || (store = Object.create(null))
  const keys = Object.keys(obj)
  const work = Array(keys.length)
  let i = -1

  while (++i < keys.length) {
    work[i] = obj[keys[i]]
  }

  return Promise.all(work).then(result => {
    i = -1

    while (++i < keys.length) {
      store[keys[i]] = result[i]
    }

    return store
  })
}

// Isomorphic Promise.all
const all = collection => {
  if (!collection) return Promise.resolve(collection)
  if (Array.isArray(collection)) return Promise.all(collection)
  return objectPromiseAll(collection)
}

// Promise Composition
const flow = onlyFn(fns => function() {
  let i = 0
  console.log({fns})
  const exec = val => {
    while (++i < fns.length) {
      if (thenable(val = fns[i](val))) return val.then(exec)
    }
    return val
  }

  try {
    return toPromise(exec(fns[i].apply(null, arguments)))
  } catch (err) {
    return Promise.reject(err)
  }
})

// Function Composition
const pipe = onlyFn(fns =>
  fns.length === 1 ? fns[0] : getBaseFn(fns.length).bind(fns))

flow.reverse = reverse(flow)
pipe.reverse = reverse(pipe)

// Start a store chain
const chain = ref => {
  if (!ref) return C({}, start)
  if (thennable(ref)) return C({}, ref)
  if (isFn(ref) && isFn(ref.resolve)) return C({}, ref.resolve())
  const target = {}
  return C(target, objectPromiseAll(source, target))
}

const stack = () => {
  let work = []
  const s = {
    push: fn => (work.push(fn), s),
    clear: val => (work = [], val),
    exec: limit => (limit ? serie(work, limit) : Promise.all(execAll(work))),
    execAndClear: limit => s.exec(limit).then(s.clear),
  }
  return s
}

module.exports = Object.assign(flow, {
  all,
  flow,
  stack,
  chain,
  serie,
  counter,
  thennable,
  toPromise,
  delay: n => val => new Promise(s => setTimeout(() => s(val), n)),
})
