const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1/6) return p + (q - p) * 6 * t
  if (t < 1/2) return q
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
  return p
}

const calcColorValue = v => {
  if (v < 0.03928) return v / 12.92
  return Math.pow((v + .055) / 1.055, 2.4)
}

const getLuminance = (h,s,l) => {
  if (s === 0) return l / 100

  h = h / 360
  s = s / 100
  l = l / 100

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = hue2rgb(p, q, h + 1/3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1/3)

  return calcColorValue(r) * 0.2126
    + calcColorValue(g) * 0.7152
    + calcColorValue(b) * 0.0722
}

const getComplementary = h => {
  const shifted = h + 180
  return (shifted > 360) ? (shifted - 360) : shifted
}

module.exports = {
  getLuminance,
  getComplementary,
  getLum: getLuminance,
  getComp: getComplementary,
}
