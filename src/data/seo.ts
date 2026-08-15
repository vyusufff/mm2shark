/** Shared SEO helpers — freshness labels, formatting, reserved hub paths. */

export function seoMonthYear(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Number.isInteger(value)) return value.toLocaleString('en-US')
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function formatAvg(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0'
  if (value >= 1000) {
    const k = value / 1000
    return `${k >= 100 ? Math.round(k) : k.toFixed(k >= 10 ? 0 : 1)}K`
  }
  return formatValue(Math.round(value * 10) / 10)
}
