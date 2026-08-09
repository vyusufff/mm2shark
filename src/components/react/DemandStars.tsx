import { useId } from 'react'

/** Map Traderie 0–10 demand onto a 0–5 star scale (supports halves). */
export function demandToStars(demand: number): number {
  const n = Number.isFinite(demand) ? Math.max(0, Math.min(10, demand)) : 0
  return Math.round(n) / 2
}

export function DemandStars({ demand }: { demand: number }) {
  const uid = useId().replace(/:/g, '')
  const stars = demandToStars(demand)
  const label = `${stars} / 5 demand`

  return (
    <div className="demand-stars" title={label} aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, stars - i))
        const gid = `${uid}-s${i}`
        return (
          <span key={i} className="demand-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <defs>
                <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                  <stop offset={`${fill * 100}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.6l2.6 6.2 6.7.6-5.1 4.4 1.6 6.5L12 16.8 6.2 20.3l1.6-6.5L2.7 9.4l6.7-.6L12 2.6z"
                fill={`url(#${gid})`}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )
      })}
    </div>
  )
}
