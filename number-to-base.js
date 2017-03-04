const base = chars => {
  const max = chars.length
  const baseLoop = (num, res='') => {
    const mod = num % max
    const remaining = Math.floor(num / max)
    const c = chars[mod] + res

    return (remaining <= 0) ? c : baseLoop(remaining, c)
  }
  return baseLoop
}

const _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
base.safe64 = base(`${_chars}-_`)
base.base64 = base(`${_chars}+/`)

module.exports = base
