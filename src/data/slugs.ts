import type { Mm2Item } from './catalog'
import { HUB_SLUGS } from './hubs'
import { ALL_TRADEABLES } from './items'

const YEAR_SUFFIX = /\s+(19|20)\d{2}\s*$/

/** Strip a single trailing year (e.g. "Gun 2023" → "Gun") */
export function stripTrailingYear(name: string): string {
  return name.replace(YEAR_SUFFIX, '').trim()
}

/**
 * Drop year from names that are unique without it.
 * Keep year when multiple items share the same base (Cane Knife 2015/2018…).
 */
export function resolveDisplayName(name: string, allNames: string[]): string {
  const base = stripTrailingYear(name)
  if (!base || base === name) return name
  const collisions = allNames.filter(
    (n) => stripTrailingYear(n).toLowerCase() === base.toLowerCase(),
  )
  return collisions.length <= 1 ? base : name
}

/** URL-safe slug from item name */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function shortId(id: string): string {
  return id.replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase() || 'item'
}

export type SlugEntry = {
  slug: string
  item: Mm2Item
}

/** Stable unique slugs for every tradeable item/set */
export function buildSlugEntries(items: Mm2Item[] = ALL_TRADEABLES): {
  entries: SlugEntry[]
  legacy: Record<string, string>
} {
  const names = items.map((i) => i.name)
  const used = new Map<string, number>()
  const entries: SlugEntry[] = []
  const legacy: Record<string, string> = {}

  for (const item of items) {
    const display = resolveDisplayName(item.name, names)
    let base = slugifyName(display) || `item-${shortId(item.id)}`
    // Never collide with /values/godly-style hub routes
    if (HUB_SLUGS.has(base)) base = `${base}-${shortId(item.id)}`
    const seen = used.get(base) || 0
    used.set(base, seen + 1)
    const slug = seen === 0 ? base : `${base}-${shortId(item.id)}`
    entries.push({ slug, item: { ...item, name: display } })

    // Old Traderie id slugs often keep the year — redirect to clean URL
    const idSlug = slugifyName(item.id)
    if (idSlug && idSlug !== slug) legacy[idSlug] = slug
    const rawNameSlug = slugifyName(item.name)
    if (rawNameSlug && rawNameSlug !== slug) legacy[rawNameSlug] = slug
  }

  return { entries, legacy }
}

const BUILT = buildSlugEntries()
const BY_SLUG = new Map(BUILT.entries.map((e) => [e.slug, e.item]))
const BY_ID = new Map(BUILT.entries.map((e) => [e.item.id, e.slug]))

export const SLUG_ENTRIES = BUILT.entries
export const LEGACY_SLUG_REDIRECTS = BUILT.legacy

export function itemSlug(item: Mm2Item): string {
  return BY_ID.get(item.id) || slugifyName(resolveDisplayName(item.name, [item.name]))
}

export function itemBySlug(slug: string): Mm2Item | undefined {
  return BY_SLUG.get(slug)
}

export function itemHref(item: Mm2Item): string {
  return `/values/${itemSlug(item)}/`
}

export function displayName(item: Mm2Item): string {
  return BY_SLUG.get(itemSlug(item))?.name || item.name
}
