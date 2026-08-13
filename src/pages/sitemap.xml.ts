import type { APIRoute } from 'astro'
import { SLUG_ENTRIES } from '../data/slugs'

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.toString() || 'https://mm2shark.com').replace(/\/$/, '')

  const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/values/', changefreq: 'daily', priority: '0.9' },
    { path: '/calculator/', changefreq: 'weekly', priority: '0.9' },
    { path: '/faq/', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy/', changefreq: 'yearly', priority: '0.2' },
    { path: '/terms/', changefreq: 'yearly', priority: '0.2' },
  ]

  const priorityRarity = new Set(['Godly', 'Chroma', 'Ancient', 'Vintage', 'Unique'])

  const urls = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${origin}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    ),
    ...SLUG_ENTRIES.map(({ slug, item }) => {
      const priority = priorityRarity.has(item.rarity)
        ? '0.7'
        : item.type === 'Set'
          ? '0.55'
          : '0.45'
      return `  <url>
    <loc>${origin}/values/${slug}/</loc>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`
    }),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
