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

module.exports = fn => {
  const len = fn.length
  function curryfier(args) {
    return (args.length < len)
      ? function () { return curryfier(mergeArgs(args, arguments)) }
      : fn.apply(null, args)
  }
  return function () { return curryfier(arguments) }
}
