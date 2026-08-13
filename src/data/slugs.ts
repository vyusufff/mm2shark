import type { Mm2Item } from './catalog'
import { ALL_TRADEABLES } from './items'

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
export function buildSlugEntries(items: Mm2Item[] = ALL_TRADEABLES): SlugEntry[] {
  const used = new Map<string, number>()
  const entries: SlugEntry[] = []

  for (const item of items) {
    let base = slugifyName(item.name) || `item-${shortId(item.id)}`
    const seen = used.get(base) || 0
    used.set(base, seen + 1)
    const slug = seen === 0 ? base : `${base}-${shortId(item.id)}`
    entries.push({ slug, item })
  }

  return entries
}

const ENTRIES = buildSlugEntries()
const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e.item]))
const BY_ID = new Map(ENTRIES.map((e) => [e.item.id, e.slug]))

export const SLUG_ENTRIES = ENTRIES

export function itemSlug(item: Mm2Item): string {
  return BY_ID.get(item.id) || slugifyName(item.name)
}

export function itemBySlug(slug: string): Mm2Item | undefined {
  return BY_SLUG.get(slug)
}

export function itemHref(item: Mm2Item): string {
  return `/values/${itemSlug(item)}/`
}
