const pass = _ => _
const oops = module.exports = code => {
  const make = err => {
    if (!(err instanceof Error)) {
      err = Error('unexpected error occured')
    }
    err.code = code
    return err
  }

  make.handle = fn => err => {
    if (err.code === code) return fn(err)
    throw err
  }
  make.ignore = make.handle(pass)
  return make
}

module.exports[404] = module.exports.notFound = oops(404)

