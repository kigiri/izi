const Strict = require("node-expat").Parser
const Lax = require("htmlparser2").Parser

const pass = _ => _

const parser = cbs => {
  let _data
  const p = new Strict("UTF-8")

  p.on('startElement', cbs.onopentag)
  p.on('text', cbs.ontext);
  p.on('endElement', cbs.onclosetag)
  p.on('error', err => (err === "mismatched tag")
    ? parser.lax(cbs, pass)(_data)
    : cbs.onerror(err))

  return data => p.write(_data = data)
}

parser.lax = cbs => {
  const p = new Lax(cbs)

  cbs.parser = p

  return data => {
    p.write(data)
    p.end()
  }
}

module.exports = (cbs, strict) => strict ? parser(cbs) : parser.lax(cbs)
