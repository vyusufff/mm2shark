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
 */
export const SIDEBAR_FILTERS = [
  { id: 'all', label: 'All Items', kind: 'all' as const },
  { id: 'Godly', label: 'Godlies', kind: 'rarity' as const },
  { id: 'Chroma', label: 'Chromas', kind: 'rarity' as const },
  { id: 'Ancient', label: 'Ancients', kind: 'rarity' as const },
  { id: 'Vintage', label: 'Vintages', kind: 'rarity' as const },
  { id: 'Unique', label: 'Uniques', kind: 'rarity' as const },
  { id: 'Legendary', label: 'Legendaries', kind: 'rarity' as const },
  { id: 'Rare', label: 'Rares', kind: 'rarity' as const },
  { id: 'Uncommon', label: 'Uncommons', kind: 'rarity' as const },
  { id: 'Common', label: 'Commons', kind: 'rarity' as const },
  { id: 'Pet', label: 'Pets', kind: 'type' as const },
  { id: 'Set', label: 'Sets', kind: 'type' as const },
]
