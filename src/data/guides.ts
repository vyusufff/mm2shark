export type Guide = {
  slug: string
  title: string
  description: string
  kicker: string
  updated: string
  /** HTML-safe paragraphs / sections rendered in Astro */
  sections: Array<{
    h2: string
    paragraphs: string[]
    bullets?: string[]
    table?: { headers: string[]; rows: string[][] }
  }>
}

export const GUIDES: Guide[] = [
  {
    slug: 'mm2-summer-event-2026',
    title: 'MM2 Summer Event 2026: Shells, Summer Box & Item Values',
    description:
      'Murder Mystery 2 Summer Event 2026 guide — Shells, Summer Box odds, Beach Bundle notes, and how to check live item values on MM2Shark.',
    kicker: 'Event guide',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'What is live right now',
        paragraphs: [
          'The Murder Mystery 2 Summer Event 2026 brought a seasonal lobby, the Pier map, daily Shells quests, the Summer Box ’26, and limited Robux bundle items. Event windows move prices fast — always confirm the latest number on the value list before you trade.',
          'Community reports put the event end around late August 2026. Treat end dates as unofficial until Nikilis posts a final notice in-game or on socials.',
        ],
      },
      {
        h2: 'Shells and daily quests',
        paragraphs: [
          'Shells are the summer currency. You earn them from daily quests (typically coin collection style objectives during rounds). Caps and quest refresh follow the in-game timer — finish dailies if you are targeting box opens.',
        ],
        bullets: [
          'Prioritize quests you can finish in normal play so you do not burn sessions on inefficient tasks.',
          'Gems can sometimes substitute for Shells on the box — check the live shop prompt in MM2.',
          'When the event ends, Shells stop mattering; only the items you unboxed keep trade value.',
        ],
      },
      {
        h2: 'Summer Box ’26 — what to watch',
        paragraphs: [
          'The Summer Box is the main loot source for this event’s commons through godlies. Exact odds are shown in-game on the box UI; they can include a Godly knife (Icecream) and a rare Chroma roll.',
          'Box items spike during the event and often correct afterward. Use MM2Shark item pages for each drop name, then run both sides through the trade calculator.',
        ],
      },
      {
        h2: 'Beach Bundle and Robux items',
        paragraphs: [
          'Limited Robux bundles (for example Beachy / Sands style godlies plus effects) are priced on hype and supply. Compare the bundle cost in Robux against current trade values of the pieces — sometimes buying is worse than trading for the same flex.',
        ],
      },
      {
        h2: 'How to trade event items safely',
        paragraphs: [
          'Search each item on the MM2Shark value list, open its page for demand, then paste both inventories into the calculator. Event week is peak scam season — never go first with high-value pieces, and ignore “trusted middleman” DMs outside official Discord contexts you already know.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-trade-in-mm2',
    title: 'How to Trade in Murder Mystery 2 (2026 Beginner Guide)',
    description:
      'Learn how trading works in Roblox Murder Mystery 2 — unlock trading, send requests, read values, and use a trade calculator so you do not get underpaid.',
    kicker: 'Beginner guide',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'Unlock trading',
        paragraphs: [
          'Murder Mystery 2 locks trading until you reach the required level (commonly Level 10). Play rounds, level up, then open the trade UI from the menu once it unlocks.',
        ],
      },
      {
        h2: 'Sending and accepting trades',
        paragraphs: [
          'Walk up to a player (or use the trade list), send a request, and wait for them to accept. Both sides add items, confirm, and the game swaps inventories when both ready up.',
          'Double-check every slot before you confirm — scammers rely on last-second swaps and lookalike items.',
        ],
      },
      {
        h2: 'Read values before you accept',
        paragraphs: [
          'Community value lists (including MM2Shark) estimate what traders usually ask. They are not official Roblox prices. Demand stars and rarity help you judge how easy an item is to flip.',
        ],
        bullets: [
          'Open the value list and search both sides.',
          'Use the trade calculator for Win / Fair / Lose on totals.',
          'Be careful with duplex / chrome lookalikes and set pieces listed separately.',
        ],
      },
      {
        h2: 'Where MM2Shark helps',
        paragraphs: [
          'Browse the full MM2 value list, open per-item pages for demand, filter by rarity hubs like Godly or Chroma, then compare the deal in the calculator. That loop is enough for most beginner and mid-tier trades.',
        ],
      },
    ],
  },
  {
    slug: 'mm2-trading-scams',
    title: 'MM2 Trading Scams to Avoid (2026)',
    description:
      'Common Murder Mystery 2 trading scams — last-second swaps, fake middlemen, Discord phishing, and how to protect high-value items.',
    kicker: 'Safety',
    updated: '2026-08-16',
    sections: [
      {
        h2: 'Last-second item swaps',
        paragraphs: [
          'A player adds a high-value item, you ready up, then they swap to junk right before confirm. Always re-check the trade window after any change. If something feels rushed, decline.',
        ],
      },
      {
        h2: 'Lookalike and low-tier bait',
        paragraphs: [
          'Similar names and recolors get people to overpay. Confirm rarity tags and open the exact item page on MM2Shark when the name looks familiar but the value feels wrong.',
        ],
      },
      {
        h2: 'Fake middlemen and Discord links',
        paragraphs: [
          'Nobody reputable needs you to “verify” by trading first or logging into a cloned site. Official-looking Discord DMs that ask for passwords, cookies, or .ROBLOSECURITY tokens are theft. MM2Shark will never ask for your Roblox password.',
        ],
      },
      {
        h2: 'Quick safety checklist',
        paragraphs: ['Before any large trade:'],
        bullets: [
          'Compare both sides in the MM2 trade calculator.',
          'Screenshot the window if you need proof later.',
          'Do not go first with ancients, chromas, or uniques for strangers.',
          'Ignore pressure tactics (“only 10 seconds left”).',
        ],
      },
    ],
  },
]

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
