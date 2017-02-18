const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'

const rand = (lower, upper) =>
  lower + Math.floor(Math.random() * (upper - lower + 1))

const base64 = (num, res='') => {
  const mod = num % 64
  const remaining = Math.floor(num / 64)
  const c = chars[mod] + res

  return (remaining <= 0) ? c : base64(remaining, c)
}

const min = Math.pow(64, 7)
const max = Math.pow(64, 8)

module.exports = () => base64(rand(min, max))
  + base64(rand(min, max))
  + base64(rand(min, max))
  + base64(rand(min, max))
