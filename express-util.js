const ok = done => val => done(null, val)
const nok = done => err => done(err)
const wrap = (done, q) => q.then(ok(done), nok(done))

module.exports = {
  wrap,
  done: fn => (...args) => wrap(args.pop(), fn(...args)),
}
