const Parkour = require("./parkour")
const { stringify } = require("querystring")
const Url = require("url")
const Protocol = {
  "http:": require("http"),
  "https:": require("https"),
};

// 'this' argument in Solvers is the response object
function solveJSON(body, resolve, reject) {
  try { resolve(JSON.parse(body)) }
  catch (err) { reject(err) }
}

const pass = body => body
const getCb = (resolve, reject, solver) => res => {
  res.setEncoding('utf8')
  const body = []

  res.on('data', d => body.push(d))
  res.on('end', () =>
    resolve((solver || pass).call(res, body.join(''), reject)))
}

const wrapCb = (cb, resolve, reject) => cb
  ? res => cb.call(res, resolve, reject)
  : getCb(resolve, reject)

const setOpts = opts => typeof opts === "string" ? Url.parse(opts) : opts

const send = (opts, type, cb, error) =>
  Protocol[opts.protocol][type](opts, cb).on('error', error)

const request = (opts, cb, error) => send(setOpts(opts), "request", cb, error)
const get = (opts, cb, error) => send(setOpts(opts), "get", cb, error)

const linkCb = (resolve, reject, cb) => (opts, data) => {
  opts = setOpts(opts)
  if (data) {
    data = stringify(data)
    if (!opts.method) {
      opts.method = "POST"
    }
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    opts.headers['Content-Length'] = data.length
  }
  let req = request(opts, wrapCb(cb, resolve, reject), reject)
  if (data) {
    req.write()
  }
  req.end()
}

// the optionnal cb will be called with the this as the response object
// and the promise resolve and reject
const Link = (opts, cb) => {
  let data
  let q = new Promise((resolve, reject) => cb = linkCb(resolve, reject, cb))

  const $ = {
    then: fn => {
      q = q.then(fn)
      if (cb) {
        cb(opts, data)
        cb = null
      }
      return $
    },
    catch: fn => { q = q.then(fn); return $ },
    form: data => { data = data; return $ }
  };

  return $;
}

Link.json = (opts) => new Promise((resolve, reject) =>
  get(opts, getCb(resolve, reject, solveJSON), reject));

Link.html = (opts, strict) => {
  const p = Parkour(strict);

  function amICalled(arg) {
    p.from(arg);
  }
  get(opts, getCb(amICalled, p.fail), p.fail);
  return p;
};

module.exports = Link;