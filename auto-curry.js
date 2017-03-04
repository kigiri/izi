const mergeArgs = (a, b) => {
  const start = a.length
  const max = start + b.length

  if (start === max) return a

  const args = Object.create(null)
  args.length = max

  let i = -1

  while (++i < start) {
    args[i] = a[i]
  }

  while (i < max) {
    args[i] = b[i - start]
    ++i
  }

  return args
}

module.exports = (fn, ary) => {
  ary || (ary = fn.length)
  function curryfier(args) {
    return (args.length < ary)
      ? function () { return curryfier(mergeArgs(args, arguments)) }
      : fn.apply(null, args)
  }
  return function () { return curryfier(arguments) }
}

module.exports.mergeArgs = mergeArgs