import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Mm2Item } from '../../data/catalog'
import { ITEMS, ITEMS_META } from '../../data/items'

type Side = 'you' | 'them'

type Slot = {
  item: Mm2Item
  amount: number
}

const SLOT_COUNT = 4
const MAX_AMOUNT = 400

const RARITY_FILTERS = [
  'All',
  'Godly',
  'Chroma',
  'Ancient',
  'Vintage',
  'Unique',
  'Legendary',
  'Rare',
  'Uncommon',
  'Common',
] as const

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

function rarityColor(item: Mm2Item) {
  return item.rarityColor || ITEMS_META.rarityColors[item.rarity] || '#9a9aa3'
}

function nameplateStyle(item: Mm2Item): CSSProperties {
  const isChroma = item.rarity === 'Chroma' || !!item.chroma
  const color = isChroma
    ? ITEMS_META.rarityColors.Godly || '#ff4dc4'
    : rarityColor(item)
  const hex = color.replace('#', '')
  if (hex.length !== 6) return { background: color, color: '#fff' }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return { background: color, color: luma > 0.62 ? '#111' : '#fff' }
}

/** Compact label so slot names stay readable */
function slotLabel(name: string, isChroma = false) {
  let label = name.replace(/^Chroma\s+/i, '')
  if (isChroma) {
    return label.replace(/\s+\d{4}$/, '')
  }
  return label
    .replace(/\s+Gun\s+(\d{4})$/i, ' $1')
    .replace(/\s+Knife\s+(\d{4})$/i, ' $1')
}

function sideTotal(slots: Array<Slot | null>) {
  return slots.reduce((sum, s) => sum + (s ? s.item.value * s.amount : 0), 0)
}

function verdict(you: number, them: number) {
  if (you === 0 && them === 0) return { label: 'Fair', tone: 'fair' as const, diff: 0 }
  const diff = them - you
  const avg = (you + them) / 2 || 1
  const pct = Math.abs(diff) / avg
  if (pct < 0.08) return { label: 'Fair', tone: 'fair' as const, diff }
  if (diff > 0) return { label: 'Win', tone: 'win' as const, diff }
  return { label: 'Lose', tone: 'lose' as const, diff }
}

function emptySlots(): Array<Slot | null> {
  return Array.from({ length: SLOT_COUNT }, () => null)
}

export function Calculator() {
  const [you, setYou] = useState<Array<Slot | null>>(emptySlots)
  const [them, setThem] = useState<Array<Slot | null>>(emptySlots)
  const [pickerSide, setPickerSide] = useState<Side | null>(null)
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState<(typeof RARITY_FILTERS)[number]>('All')
  const [amountText, setAmountText] = useState('1')
  const searchRef = useRef<HTMLInputElement>(null)

  const youValue = sideTotal(you)
  const themValue = sideTotal(them)
  const result = verdict(youValue, themValue)
  const total = youValue + themValue
  const themPct = total === 0 ? 50 : (themValue / total) * 100

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ITEMS.filter((item) => {
      if (item.type === 'Set' || item.rarity === 'Set') return false
      if (rarity !== 'All' && item.rarity !== rarity) return false
      if (q && !item.name.toLowerCase().includes(q)) return false
      return true
    }).slice(0, 100)
  }, [query, rarity])

  useEffect(() => {
    if (!pickerSide) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerSide(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerSide])

  // Lock page scroll; keep sheet inside the visible viewport (keyboard-safe on mobile).
  // Do not autofocus search on touch — that pops the keyboard and shoves the close button.
  useEffect(() => {
    if (!pickerSide) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (finePointer) {
      searchRef.current?.focus({ preventScroll: true })
    }

    const root = document.documentElement
    const syncViewport = () => {
      const vv = window.visualViewport
      const h = vv?.height ?? window.innerHeight
      const top = vv?.offsetTop ?? 0
      root.style.setProperty('--picker-vvh', `${Math.round(h)}px`)
      root.style.setProperty('--picker-vvt', `${Math.round(top)}px`)
    }
    syncViewport()
    window.visualViewport?.addEventListener('resize', syncViewport)
    window.visualViewport?.addEventListener('scroll', syncViewport)
    window.addEventListener('resize', syncViewport)

    return () => {
      document.body.style.overflow = prevOverflow
      root.style.removeProperty('--picker-vvh')
      root.style.removeProperty('--picker-vvt')
      window.visualViewport?.removeEventListener('resize', syncViewport)
      window.visualViewport?.removeEventListener('scroll', syncViewport)
      window.removeEventListener('resize', syncViewport)
    }
  }, [pickerSide])

  function openPicker(side: Side) {
    const slots = side === 'you' ? you : them
    if (slots.every(Boolean)) return
    setPickerSide(side)
    setQuery('')
    setRarity('All')
    setAmountText('1')
  }

  function parseAmount() {
    const n = parseInt(amountText, 10)
    if (!Number.isFinite(n) || n < 1) return 1
    return Math.min(MAX_AMOUNT, n)
  }

  function onAmountChange(raw: string) {
    // Allow clearing while typing (fixes mobile "can't delete 1 → becomes 11")
    if (raw === '') {
      setAmountText('')
      return
    }
    if (!/^\d+$/.test(raw)) return
    const n = parseInt(raw, 10)
    if (!Number.isFinite(n)) return
    if (n > MAX_AMOUNT) {
      setAmountText(String(MAX_AMOUNT))
      return
    }
    setAmountText(raw)
  }

  function onAmountBlur() {
    setAmountText(String(parseAmount()))
  }

  function bumpAmount(delta: number) {
    setAmountText(String(Math.max(1, Math.min(MAX_AMOUNT, parseAmount() + delta))))
  }

  function removeSlot(side: Side, index: number) {
    const setter = side === 'you' ? setYou : setThem
    setter((prev) => {
      const next = prev.filter((_, i) => i !== index)
      while (next.length < SLOT_COUNT) next.push(null)
      return next
    })
  }

  function addItem(item: Mm2Item) {
    if (!pickerSide) return
    const qty = parseAmount()
    const setter = pickerSide === 'you' ? setYou : setThem

    setter((prev) => {
      const next = [...prev]
      const existing = next.findIndex((s) => s?.item.id === item.id)
      if (existing >= 0) {
        const cur = next[existing]!
        next[existing] = {
          item: cur.item,
          amount: Math.min(MAX_AMOUNT, cur.amount + qty),
        }
        return next
      }
      const empty = next.findIndex((s) => s === null)
      if (empty < 0) return prev
      next[empty] = { item, amount: qty }
      return next
    })

    setPickerSide(null)
  }

  function clearAll() {
    setYou(emptySlots())
    setThem(emptySlots())
  }

  const canAddYou = you.some((s) => s === null)
  const canAddThem = them.some((s) => s === null)

  return (
    <section className="calc-shell">
      <header className="values-head calc-head">
        <div>
          <p className="legal-kicker calc-kicker">Calculator</p>
          <h1>Trade Calculator</h1>
          <p className="calc-sub">Compare both sides of an MM2 trade. Stack amounts in the add popup.</p>
        </div>
        <button type="button" className="calc-clear" onClick={clearAll}>
          Clear
        </button>
      </header>

      <div className={`calc-result calc-result-${result.tone}`}>
        <strong>{result.label}</strong>
        <div className="calc-balance" aria-hidden="true">
          <span className="calc-bal-gain" style={{ width: `${themPct}%` }} />
        </div>
        <div className="calc-totals">
          <div>
            <em>You</em>
            <b>{formatValue(youValue)}</b>
          </div>
          <div className="calc-delta">
            {result.diff > 0 ? '+' : ''}
            {formatValue(result.diff)}
          </div>
          <div>
            <em>Them</em>
            <b>{formatValue(themValue)}</b>
          </div>
        </div>
      </div>

      <div className="calc-board">
        <SidePanel
          title="You"
          slots={you}
          canAdd={canAddYou}
          onAdd={() => openPicker('you')}
          onRemove={(i) => removeSlot('you', i)}
        />
        <SidePanel
          title="Them"
          slots={them}
          canAdd={canAddThem}
          onAdd={() => openPicker('them')}
          onRemove={(i) => removeSlot('them', i)}
        />
      </div>

      {pickerSide && (
        <div className="picker-backdrop" onClick={() => setPickerSide(null)} role="presentation">
          <div
            className="picker"
            role="dialog"
            aria-modal="true"
            aria-label="Add item"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="picker-head">
              <div>
                <p className="picker-kicker">Add item</p>
                <h2>{pickerSide === 'you' ? 'You' : 'Them'}</h2>
              </div>
              <button
                type="button"
                className="picker-close"
                aria-label="Close"
                onClick={() => setPickerSide(null)}
              >
                ✕
              </button>
            </div>

            <div className="picker-toolbar">
              <label className="picker-search">
                <span>Search</span>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Knives, guns, pets…"
                  autoComplete="off"
                  enterKeyHint="search"
                  inputMode="search"
                />
              </label>
              <div className="picker-amount">
                <span id="picker-amount-label">Amount</span>
                <div className="picker-amount-controls">
                  <button
                    type="button"
                    className="picker-amount-btn"
                    aria-label="Decrease amount"
                    onClick={() => bumpAmount(-1)}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    enterKeyHint="done"
                    autoComplete="off"
                    aria-labelledby="picker-amount-label"
                    value={amountText}
                    onChange={(e) => onAmountChange(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={onAmountBlur}
                  />
                  <button
                    type="button"
                    className="picker-amount-btn"
                    aria-label="Increase amount"
                    onClick={() => bumpAmount(1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="picker-rarities" role="tablist" aria-label="Rarity filter">
              {RARITY_FILTERS.map((r) => {
                const isChroma = r === 'Chroma'
                const color =
                  r === 'All' ? undefined : ITEMS_META.rarityColors[r] || '#9a9aa3'
                return (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    aria-selected={rarity === r}
                    className={`picker-rarity${rarity === r ? ' is-active' : ''}${isChroma ? ' is-chroma' : ''}`}
                    style={
                      isChroma
                        ? undefined
                        : rarity === r && color
                          ? { borderColor: color, color, background: `${color}22` }
                          : color
                            ? { color }
                            : undefined
                    }
                    onClick={() => setRarity(r)}
                  >
                    {r}
                  </button>
                )
              })}
            </div>

            <div className="picker-list">
              {results.map((item) => {
                const isChroma = item.rarity === 'Chroma' || !!item.chroma
                const color = rarityColor(item)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="picker-row"
                    onClick={() => addItem(item)}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" width={44} height={44} loading="lazy" />
                    ) : (
                      <span className="picker-fallback">?</span>
                    )}
                    <span className="picker-meta">
                      <strong>{item.name}</strong>
                      {isChroma ? (
                        <em className="picker-chroma-label">Chroma</em>
                      ) : (
                        <em style={{ color }}>{item.rarity}</em>
                      )}
                    </span>
                    <span className="picker-value">{formatValue(item.value)}</span>
                  </button>
                )
              })}
              {results.length === 0 && <p className="values-empty">No items found.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function SidePanel({
  title,
  slots,
  canAdd,
  onAdd,
  onRemove,
}: {
  title: string
  slots: Array<Slot | null>
  canAdd: boolean
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  const addIndex = slots.findIndex((s) => s === null)

  return (
    <div className="calc-side">
      <h2>{title}</h2>
      <div className="calc-grid">
        {slots.map((slot, index) => {
          if (slot) {
            const isChroma = slot.item.rarity === 'Chroma' || !!slot.item.chroma
            return (
              <button
                key={`${slot.item.id}-${index}`}
                type="button"
                className={`calc-slot is-filled${isChroma ? ' is-chroma' : ''}`}
                onClick={() => onRemove(index)}
                aria-label={`Remove ${slot.item.name}${slot.amount > 1 ? ` x${slot.amount}` : ''} from ${title}`}
              >
                <span className="calc-slot-art">
                  {slot.item.image ? (
                    <img src={slot.item.image} alt="" width={110} height={110} />
                  ) : (
                    <span className="calc-slot-fallback">?</span>
                  )}
                  {isChroma && <span className="calc-chroma-tag">Chroma</span>}
                  {slot.amount > 1 && <em className="calc-stack">x{slot.amount}</em>}
                </span>
                <span className="calc-slot-name" style={nameplateStyle(slot.item)}>
                  <span className="calc-slot-label">{slotLabel(slot.item.name, isChroma)}</span>
                </span>
              </button>
            )
          }

          const isAdd = canAdd && index === addIndex
          return (
            <button
              key={`empty-${index}`}
              type="button"
              className={`calc-slot is-empty${isAdd ? ' is-add' : ''}`}
              onClick={isAdd ? onAdd : undefined}
              disabled={!isAdd}
              aria-label={
                isAdd ? `Add item to ${title}` : `${title} empty slot ${index + 1}`
              }
            >
              {isAdd ? <span aria-hidden="true">+</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
