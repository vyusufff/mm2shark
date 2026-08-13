import { useEffect, useMemo, useRef, useState } from 'react'
import { SIDEBAR_FILTERS, type Mm2Item } from '../../data/catalog'
import { ITEMS, SETS } from '../../data/items'
import { itemHref } from '../../data/slugs'
import { DemandStars } from './DemandStars'

type SortKey = 'value-desc' | 'value-asc' | 'name' | 'demand'

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
  // Legacy knife/gun type links still work even if removed from sidebar
  if ((filter === 'Knife' || filter === 'Gun') && type) filter = type
  const sort = (sp.get('sort') as SortKey) || 'value-desc'
  return { filter, sort, q: sp.get('q') || '' }
}

function writeParams(filter: string, sort: SortKey, q: string) {
  const sp = new URLSearchParams()
  if (filter !== 'all') {
    const meta = SIDEBAR_FILTERS.find((f) => f.id === filter)
    if (meta?.kind === 'rarity') sp.set('rarity', filter)
    else if (meta?.kind === 'type') sp.set('type', filter)
    else if (filter === 'Knife' || filter === 'Gun') sp.set('type', filter)
    else sp.set('filter', filter)
  }
  if (sort !== 'value-desc') sp.set('sort', sort)
  if (q.trim()) sp.set('q', q.trim())
  const next = `${window.location.pathname}${sp.toString() ? `?${sp}` : ''}`
  window.history.replaceState(null, '', next)
}

export function ValueList() {
  const items = ITEMS
  const sets = SETS

  const initial = readParams()
  const [query, setQuery] = useState(initial.q)
  const [filter, setFilter] = useState(initial.filter)
  const [sort, setSort] = useState<SortKey>(initial.sort)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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
      if (filter === 'Knife' || filter === 'Gun') return item.type === filter
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
  }, [filter, sort, query])

  useEffect(() => {
    if (!menuId) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuId])

  const activeLabel =
    SIDEBAR_FILTERS.find((f) => f.id === filter)?.label ||
    (filter === 'Knife' ? 'Knives' : filter === 'Gun' ? 'Guns' : 'All Items')

  async function copyLink(item: Mm2Item) {
    const url = `${window.location.origin}${itemHref(item)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
    setMenuId(null)
  }

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
                <em>{counts[f.id] ?? 0}</em>
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
            Showing <strong>{filtered.length}</strong> · {activeLabel}
          </p>

          <div className="values-grid">
            {filtered.map((item) => {
              const href = itemHref(item)
              const open = menuId === item.id
              return (
                <article key={item.id} className="values-card">
                  <div className="values-card-menu" ref={open ? menuRef : undefined}>
                    <button
                      type="button"
                      className="values-card-more"
                      aria-label={`More for ${item.name}`}
                      aria-expanded={open}
                      onClick={() => setMenuId(open ? null : item.id)}
                    >
                      ⋯
                    </button>
                    {open && (
                      <div className="values-card-dropdown" role="menu">
                        <a role="menuitem" href={href}>
                          Open page
                        </a>
                        <button type="button" role="menuitem" onClick={() => copyLink(item)}>
                          Copy link
                        </button>
                      </div>
                    )}
                  </div>
                  <a className="values-card-link" href={href}>
                    <div className="values-card-img">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
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
                  </a>
                </article>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="values-empty">No items match this filter.</p>
          )}
        </div>
      </div>
    </section>
  )
}
