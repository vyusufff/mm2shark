import type { Mm2Item } from './catalog'
import { ALL_TRADEABLES } from './items'

export type HubKind = 'rarity' | 'type'

export type ValueHub = {
  /** URL segment under /values/ — must not collide with item slugs */
  slug: string
  id: string
  label: string
  plural: string
  kind: HubKind
  /** Short intro under H1 */
  lead: string
  /** Longer “About …” block for crawlers */
  about: string
}

/** Indexable browse hubs (mm2.rocks-style /values/godly pages). */
export const VALUE_HUBS: ValueHub[] = [
  {
    slug: 'godly',
    id: 'Godly',
    label: 'Godly',
    plural: 'Godlies',
    kind: 'rarity',
    lead: 'Godly weapons are among the most traded MM2 items — crate pulls, crafts, codes, and events all feed this tier.',
    about:
      'Godly is the core mid-high rarity band in Murder Mystery 2. Many classic knives and guns live here, including chromas that sit above base godlies in trade value. Use this list to compare Godly MM2 values before you accept a trade.',
  },
  {
    slug: 'chroma',
    id: 'Chroma',
    label: 'Chroma',
    plural: 'Chromas',
    kind: 'rarity',
    lead: 'Chroma variants are flashy, scarce upgrades of popular godlies — usually the headline pieces in big trades.',
    about:
      'Chroma items are special recolors of Godly weapons. They typically demand a large premium over the base item. Browse every Chroma MM2 value here, then check fairness in the trade calculator.',
  },
  {
    slug: 'ancient',
    id: 'Ancient',
    label: 'Ancient',
    plural: 'Ancients',
    kind: 'rarity',
    lead: 'Ancients are trophy-tier weapons with tiny supply — prices move hard when big collectors enter the market.',
    about:
      'Ancient items sit near the top of the MM2 hierarchy. Most are rare event or exclusive pieces with low circulation. Track Ancient MM2 values on this page whenever the market shifts.',
  },
  {
    slug: 'vintage',
    id: 'Vintage',
    label: 'Vintage',
    plural: 'Vintages',
    kind: 'rarity',
    lead: 'Vintage pieces are older specials that still matter in collector and flex trades.',
    about:
      'Vintage rarity covers classic special items that traders still price carefully. Compare Vintage MM2 values here against godlies and ancients before you lock a deal.',
  },
  {
    slug: 'unique',
    id: 'Unique',
    label: 'Unique',
    plural: 'Uniques',
    kind: 'rarity',
    lead: 'Uniques sit at the extreme top — leaderboard trophies and ultra-scarce flex items.',
    about:
      'Unique weapons are the rarest trophy tier in Murder Mystery 2. Many are untradeable trophies; tradeable Uniques (when listed) can sit at enormous values. Use this hub as a Unique MM2 values reference.',
  },
  {
    slug: 'legendary',
    id: 'Legendary',
    label: 'Legendary',
    plural: 'Legendaries',
    kind: 'rarity',
    lead: 'Legendaries bridge commons and godlies — frequent in starter and mid-game trades.',
    about:
      'Legendary items are a step above rares and show up often in everyday trading. Check Legendary MM2 values here when stacking small adds on either side of a trade.',
  },
  {
    slug: 'rare',
    id: 'Rare',
    label: 'Rare',
    plural: 'Rares',
    kind: 'rarity',
    lead: 'Rares are common trade fillers — still worth pricing so you do not overpay for bulk.',
    about:
      'Rare tier items drop more often than legendaries and godlies. Individually cheap, they still affect fairness when traded in stacks. Browse Rare MM2 values on this list.',
  },
  {
    slug: 'uncommon',
    id: 'Uncommon',
    label: 'Uncommon',
    plural: 'Uncommons',
    kind: 'rarity',
    lead: 'Uncommons are easy pulls and low-value adds — useful for learning the value scale.',
    about:
      'Uncommon items sit just above commons in drop rate and trade value. Use this Uncommon MM2 values page when checking beginner inventories and small adds.',
  },
  {
    slug: 'common',
    id: 'Common',
    label: 'Common',
    plural: 'Commons',
    kind: 'rarity',
    lead: 'Commons are the floor of the MM2 market — still listed so the full catalog stays searchable.',
    about:
      'Common items are the most obtainable weapons and cosmetics. Values are usually tiny, but a complete Common MM2 values list helps new traders learn names and avoid confusion with higher tiers.',
  },
  {
    slug: 'pets',
    id: 'Pet',
    label: 'Pet',
    plural: 'Pets',
    kind: 'type',
    lead: 'Pets trade on their own curve — holiday and event pets often spike harder than weapons.',
    about:
      'MM2 pets are a separate trade category from knives and guns. Seasonal pets can jump quickly during and after events. Browse every Pet MM2 value here, then compare in the calculator.',
  },
  {
    slug: 'sets',
    id: 'Set',
    label: 'Set',
    plural: 'Sets',
    kind: 'type',
    lead: 'Complete sets price the knife + gun (and extras) as one bundle for faster trading.',
    about:
      'Sets group matching MM2 items into a single listed value so you can price bundle trades at a glance. Use this Sets MM2 values page when someone offers a full set instead of loose pieces.',
  },
]

export const HUB_SLUGS = new Set(VALUE_HUBS.map((h) => h.slug))

export function hubBySlug(slug: string): ValueHub | undefined {
  return VALUE_HUBS.find((h) => h.slug === slug)
}

export function hubHref(hub: ValueHub): string {
  return `/values/${hub.slug}/`
}

export function itemsForHub(hub: ValueHub, pool: Mm2Item[] = ALL_TRADEABLES): Mm2Item[] {
  if (hub.kind === 'type') {
    return pool.filter((i) => i.type === hub.id)
  }
  // Match ValueList: rarity browse excludes pets
  return pool.filter((i) => i.rarity === hub.id && i.type !== 'Pet')
}

export function hubStats(items: Mm2Item[]) {
  const n = items.length
  if (!n) {
    return { count: 0, avg: 0, max: 0, top: [] as Mm2Item[] }
  }
  const sum = items.reduce((a, i) => a + (Number.isFinite(i.value) ? i.value : 0), 0)
  const sorted = [...items].sort((a, b) => b.value - a.value)
  return {
    count: n,
    avg: sum / n,
    max: sorted[0]?.value ?? 0,
    top: sorted.slice(0, 5),
  }
}
