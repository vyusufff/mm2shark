export type Guide = {
  slug: string
  title: string
  /** Short line on the guides index */
  teaser: string
  /** Meta description */
  description: string
  kicker: string
  updated: string
  sections: Array<{
    h2: string
    paragraphs: string[]
    bullets?: string[]
  }>
}

export const GUIDES: Guide[] = [
  {
    slug: 'mm2-summer-event-2026',
    title: 'Summer Event 2026',
    teaser: 'Shells, the Summer Box, and why event prices swing so hard.',
    description:
      'Quick notes on the MM2 Summer Event 2026 — Shells, box opens, and checking values before you trade.',
    kicker: 'Event',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'What’s going on',
        paragraphs: [
          'Summer Event is live: seasonal lobby, Pier map, daily Shells, Summer Box ’26, plus limited Robux bundle stuff. Prices move every day while it’s on — check the list before you accept anything big.',
          'People are saying it wraps around late August. Treat that as unofficial until it’s confirmed in-game.',
        ],
      },
      {
        h2: 'Shells',
        paragraphs: [
          'Shells come from daily quests. Do the ones you finish naturally in normal rounds. When the event ends, Shells are useless — only the items you opened keep value.',
        ],
      },
      {
        h2: 'Summer Box',
        paragraphs: [
          'The box is where most of this event’s new items come from. Odds are on the box screen in MM2. Icecream (and chroma if it hits) are the ones people hype; everything else is filler until the market settles.',
          'Event week prices are noisy. Search the item, then run the trade in the calculator if you’re unsure.',
        ],
      },
      {
        h2: 'Robux bundles',
        paragraphs: [
          'Beach-style bundles look cool and disappear after the event. Compare Robux cost to what the pieces actually trade for — buying isn’t always cheaper than waiting for a fair trade.',
        ],
      },
      {
        h2: 'Don’t get cooked',
        paragraphs: [
          'Event weeks are scam season. Re-check the window before confirm, don’t go first on heavy pieces with strangers, and ignore middleman DMs you didn’t ask for.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-trade-in-mm2',
    title: 'How trading works',
    teaser: 'Unlock trades, send a request, and check values before you confirm.',
    description:
      'How to unlock and use trading in Murder Mystery 2, plus how to read values so you don’t get underpaid.',
    kicker: 'Basics',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'Unlock it',
        paragraphs: [
          'Trading unlocks around Level 10. Grind rounds until the trade option shows up in the menu.',
        ],
      },
      {
        h2: 'Sending a trade',
        paragraphs: [
          'Request a trade, both sides add items, both ready up, then the game swaps. Watch the window until the end — last-second swaps are common.',
        ],
      },
      {
        h2: 'Values aren’t official',
        paragraphs: [
          'Lists like ours are community references, not Roblox or Nikilis prices. Use them to see if a deal is roughly fair, not as a guarantee.',
        ],
        bullets: [
          'Search both sides on the value list',
          'Totals go in the calculator (Win / Fair / Lose)',
          'Watch for lookalike names and set pieces listed separately',
        ],
      },
    ],
  },
  {
    slug: 'mm2-trading-scams',
    title: 'Common trade scams',
    teaser: 'Swaps, lookalikes, fake middlemen — the boring stuff that still works.',
    description:
      'Common Murder Mystery 2 trade scams: last-second swaps, lookalike items, and fake Discord middlemen.',
    kicker: 'Safety',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'Last-second swap',
        paragraphs: [
          'They show something good, you ready, they swap to junk. Any change = re-check every slot. Feel rushed? Decline.',
        ],
      },
      {
        h2: 'Lookalikes',
        paragraphs: [
          'Similar names and recolors trick people into overpaying. Check rarity and the real value before you confirm.',
        ],
      },
      {
        h2: 'Fake middlemen / Discord',
        paragraphs: [
          'Nobody needs your password, cookies, or “verify” trade first. We will never ask for your Roblox login.',
        ],
      },
      {
        h2: 'Before a big trade',
        paragraphs: [],
        bullets: [
          'Run both sides in the calculator',
          'Screenshot if you need proof later',
          'Don’t go first on ancients / chromas with strangers',
          'Ignore “10 seconds left” pressure',
        ],
      },
    ],
  },
]

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
