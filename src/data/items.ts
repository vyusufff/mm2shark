export type { Mm2Item } from './catalog'
export { SIDEBAR_FILTERS } from './catalog'

import payload from './items.json'
import setsPayload from './sets.json'
import type { Mm2Item } from './catalog'

export const ITEMS_META = {
  updatedAt: payload.updatedAt as string,
  source: payload.source as string,
  count: payload.count as number,
  rarityColors: (payload.rarityColors || {}) as Record<string, string>,
}

export const ITEMS = payload.items as Mm2Item[]
export const SETS = ((setsPayload as { sets?: Mm2Item[] }).sets || []) as Mm2Item[]
export const ALL_TRADEABLES = [...ITEMS, ...SETS]
