export function formatINR(paise) {
  if (paise == null) return ''
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

export function formatDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  const sameYear = s.getFullYear() === e.getFullYear()
  const mon = (d) => d.toLocaleDateString('en-IN', { month: 'short' })

  if (sameMonth) {
    return `${s.getDate()} – ${e.getDate()} ${mon(s)}, ${e.getFullYear()}`
  }
  if (sameYear) {
    return `${s.getDate()} ${mon(s)} – ${e.getDate()} ${mon(e)}, ${e.getFullYear()}`
  }
  return `${s.getDate()} ${mon(s)}, ${s.getFullYear()} – ${e.getDate()} ${mon(e)}, ${e.getFullYear()}`
}

export function difficultyLabel(d) {
  const map = {
    EASY: 'Easy',
    MODERATE: 'Moderate',
    DIFFICULT: 'Difficult',
    CHALLENGING: 'Challenging',
  }
  return map[d] ?? d
}
