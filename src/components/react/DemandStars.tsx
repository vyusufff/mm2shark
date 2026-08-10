/** Map Traderie 0–10 demand onto a 0–5 star scale (supports halves). */
export function demandToStars(demand: number): number {
  const n = Number.isFinite(demand) ? Math.max(0, Math.min(10, demand)) : 0
  return Math.round(n) / 2
}

export function DemandStars({ demand }: { demand: number }) {
  const stars = demandToStars(demand)
  const label = `${stars} / 5 demand`
  const pct = Math.max(0, Math.min(100, (stars / 5) * 100))

  return (
    <div className="demand-stars" role="img" aria-label={label} title={label}>
      <span className="demand-stars-bg" aria-hidden="true">
        ★★★★★
      </span>
      <span className="demand-stars-fill" aria-hidden="true" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </div>
  )
}
