import { useEffect, useMemo, useRef, useState } from 'react'
import { SIDEBAR_FILTERS, type Mm2Item } from '../../data/catalog'
import { DemandStars } from './DemandStars'

type SortKey = 'value-desc' | 'value-asc' | 'name' | 'demand'

const PAGE = 48

function formatValue(value: number) {
  if (!Number.isFinite(value)) return '0'
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US')
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function readParams() {
  if (typeof window === 'undefined') {
    return { filter: 'all', sort: 'value-desc' as SortKey, q: '' }
  }
  const sp = new URLSearchParams(window.location.search)
  const rarity = sp.get('rarity')
  const type = sp.get('type')
  const cat = sp.get('cat')
  let filter = sp.get('filter') || 'all'
  if (cat === 'sets') filter = 'Set'
  else if (rarity) filter = rarity
  else if (type) filter = type
  const sort = (sp.get('sort') as SortKey) || 'value-desc'
  return { filter, sort, q: sp.get('q') || '' }
}

function writeParams(filter: string, sort: SortKey, q: string) {
  const sp = new URLSearchParams()
  if (filter !== 'all') {
    const meta = SIDEBAR_FILTERS.find((f) => f.id === filter)
    if (meta?.kind === 'rarity') sp.set('rarity', filter)
    else if (meta?.kind === 'type') sp.set('type', filter)
    else sp.set('filter', filter)
  }
  if (sort !== 'value-desc') sp.set('sort', sort)
  if (q.trim()) sp.set('q', q.trim())
  const next = `${window.location.pathname}${sp.toString() ? `?${sp}` : ''}`
  window.history.replaceState(null, '', next)
}

function toWebpSrc(src: string) {
  if (!src) return src
  if (src.endsWith('.webp')) return src
  return src.replace(/\.(png|jpe?g|gif)$/i, '.webp')
}

export function ValueList() {
  const initial = readParams()
  const [items, setItems] = useState<Mm2Item[]>([])
  const [sets, setSets] = useState<Mm2Item[]>([])
  const [ready, setReady] = useState(false)
  const [query, setQuery] = useState(initial.q)
  const [filter, setFilter] = useState(initial.filter)
  const [sort, setSort] = useState<SortKey>(initial.sort)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [itemsRes, setsRes] = await Promise.all([
          fetch('/data/items.json'),
          fetch('/data/sets.json'),
        ])
        const itemsJson = await itemsRes.json()
        const setsJson = await setsRes.json()
        if (cancelled) return
        setItems((itemsJson.items || []) as Mm2Item[])
        setSets((setsJson.sets || []) as Mm2Item[])
      } catch {
        if (!cancelled) {
          setItems([])
          setSets([])
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pool = useMemo(() => [...items, ...sets] as Mm2Item[], [items, sets])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: pool.length }
    for (const f of SIDEBAR_FILTERS) {
      if (f.kind === 'all') continue
      map[f.id] = pool.filter((i) =>
        f.kind === 'rarity' ? i.rarity === f.id : i.type === f.id,
      ).length
    }
    return map
  }, [pool])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const meta = SIDEBAR_FILTERS.find((f) => f.id === filter)
    let list = pool.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false
      if (!meta || meta.kind === 'all') return true
      if (meta.kind === 'rarity') return item.rarity === meta.id
      return item.type === meta.id
    })

    list = [...list].sort((a, b) => {
      if (sort === 'value-desc') return b.value - a.value
      if (sort === 'value-asc') return a.value - b.value
      if (sort === 'demand') return b.demand - a.demand
      return a.name.localeCompare(b.name)
    })
    return list
  }, [pool, query, filter, sort])

  useEffect(() => {
    writeParams(filter, sort, query)
    setVisible(PAGE)
  }, [filter, sort, query])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((n) => Math.min(n + PAGE, filtered.length))
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [filtered.length])

  const shown = filtered.slice(0, visible)
  const activeLabel =
    SIDEBAR_FILTERS.find((f) => f.id === filter)?.label || 'All Items'

  return (
    <section className="values-shell">
      <header className="values-head">
        <div>
          <p className="legal-kicker">Value List</p>
          <h1>MM2 Values</h1>
        </div>
        <button
          type="button"
          className="values-mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? 'Hide filters' : 'Categories'}
        </button>
      </header>

      <div className="values-layout">
        <aside className={`values-side${mobileOpen ? ' is-open' : ''}`}>
          <p className="values-side-title">Browse</p>
          <nav className="values-nav" aria-label="Item categories">
            {SIDEBAR_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? 'is-active' : undefined}
                onClick={() => {
                  setFilter(f.id)
                  setMobileOpen(false)
                }}
              >
                <span>{f.label}</span>
                <em>{ready ? (counts[f.id] ?? 0) : '—'}</em>
              </button>
            ))}
          </nav>
        </aside>

        <div className="values-main">
          <div className="values-toolbar">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeLabel.toLowerCase()}…`}
              autoComplete="off"
              aria-label="Search items"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort"
            >
              <option value="value-desc">Value high</option>
              <option value="value-asc">Value low</option>
              <option value="demand">Demand</option>
              <option value="name">Name</option>
            </select>
          </div>

          <p className="values-meta">
            {ready ? (
              <>
                Showing <strong>{shown.length}</strong>
                {shown.length < filtered.length ? ` of ${filtered.length}` : ''} · {activeLabel}
              </>
            ) : (
              <>Loading values…</>
            )}
          </p>

          <div className="values-grid">
            {shown.map((item) => {
              const src = toWebpSrc(item.image || '')
              return (
                <article key={item.id} className="values-card">
                  <div className="values-card-img">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.currentTarget
                          if (item.image && img.src !== item.image) img.src = item.image
                        }}
                      />
                    ) : (
                      <span className="values-card-empty">?</span>
                    )}
                  </div>
                  <div className="values-card-body">
                    <h2>{item.name}</h2>
                    <p
                      className={
                        item.rarity === 'Chroma' ? 'rarity-chroma' : 'values-card-rarity'
                      }
                      style={
                        item.rarity !== 'Chroma'
                          ? { color: item.rarityColor || undefined }
                          : undefined
                      }
                    >
                      {item.rarity} · {item.type}
                    </p>
                    <DemandStars demand={item.demand} />
                    <p className="values-card-value">{formatValue(item.value)}</p>
                  </div>
                </article>
              )
            })}
          </div>

          {ready && filtered.length === 0 && (
            <p className="values-empty">No items match this filter.</p>
          )}
          {shown.length < filtered.length && <div ref={sentinelRef} className="values-sentinel" />}
        </div>
      </div>
    </section>
  )
}
