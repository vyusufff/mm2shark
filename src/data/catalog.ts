export type Mm2Item = {
  id: string
  name: string
  value: number
  demand: number
  rarity: string
  rarityColor?: string
  type: string
  image: string
  chroma?: boolean
}

/**
 * Sidebar browse order: rarities first, then Pets + Sets.
 * Knives/Guns stay searchable but are omitted here (no room / clutter).
 * `hub` points at the indexable /values/{slug}/ landing (SEO); All stays on-list filter.
 */
export const SIDEBAR_FILTERS = [
  { id: 'all', label: 'All Items', kind: 'all' as const, hub: null as string | null },
  { id: 'Godly', label: 'Godlies', kind: 'rarity' as const, hub: 'godly' },
  { id: 'Chroma', label: 'Chromas', kind: 'rarity' as const, hub: 'chroma' },
  { id: 'Ancient', label: 'Ancients', kind: 'rarity' as const, hub: 'ancient' },
  { id: 'Vintage', label: 'Vintages', kind: 'rarity' as const, hub: 'vintage' },
  { id: 'Unique', label: 'Uniques', kind: 'rarity' as const, hub: 'unique' },
  { id: 'Legendary', label: 'Legendaries', kind: 'rarity' as const, hub: 'legendary' },
  { id: 'Rare', label: 'Rares', kind: 'rarity' as const, hub: 'rare' },
  { id: 'Uncommon', label: 'Uncommons', kind: 'rarity' as const, hub: 'uncommon' },
  { id: 'Common', label: 'Commons', kind: 'rarity' as const, hub: 'common' },
  { id: 'Pet', label: 'Pets', kind: 'type' as const, hub: 'pets' },
  { id: 'Set', label: 'Sets', kind: 'type' as const, hub: 'sets' },
]
