/**
 * Discord server banner 960×540 (Boost L2).
 * Run: node scripts/make_discord_banner.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'discord')
const ITEMS = path.join(ROOT, 'public', 'items')
const FONTS = path.join(ROOT, 'public', 'fonts')

fs.mkdirSync(OUT, { recursive: true })

const W = 960
const H = 540

function fontDataUri(filename) {
  const buf = fs.readFileSync(path.join(FONTS, filename))
  return `data:font/ttf;base64,${buf.toString('base64')}`
}

async function itemPng(file, size, rotate = 0) {
  const src = path.join(ITEMS, file)
  let p = sharp(src, { failOn: 'none' })
    .ensureAlpha()
    .resize(size, size, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
  if (rotate) {
    p = p.rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  }
  const img = await p.png().toBuffer()
  const meta = await sharp(img).metadata()
  const pad = Math.round(size * 0.18)
  const iw = meta.width
  const ih = meta.height
  const alpha = await sharp(img)
    .extractChannel('alpha')
    .blur(Math.max(8, size * 0.06))
    .toBuffer()
  const shadow = await sharp({
    create: { width: iw, height: ih, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: iw + pad * 2,
      height: ih + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadow, left: pad + 2, top: pad + Math.round(pad * 0.35) },
      { input: img, left: pad, top: pad },
    ])
    .png()
    .toBuffer()
}

async function main() {
  const oswald = fontDataUri('oswald-700.ttf')
  const figtree = fontDataUri('figtree-600.ttf')

  const bg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0e"/>
      <stop offset="100%" stop-color="#10060a"/>
    </linearGradient>
    <radialGradient id="g" cx="72%" cy="55%" r="50%">
      <stop offset="0%" stop-color="#e11d2e" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#e11d2e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <!-- Keep top ~48px calm for Discord server title overlay -->
  <rect x="0" y="0" width="${W}" height="48" fill="#0b0b0e" fill-opacity="0.55"/>
</svg>`)

  const [shark, chroma, fang] = await Promise.all([
    itemPng('shark-gun.png', 220, -8),
    itemPng('chroma-shark-gun.png', 180, 10),
    itemPng('fang-knife.png', 160, 14),
  ])

  const type = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style><![CDATA[
      @font-face { font-family: 'O'; src: url('${oswald}'); }
      @font-face { font-family: 'F'; src: url('${figtree}'); }
    ]]></style>
    <linearGradient id="s" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#0b0b0e" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#0b0b0e" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0b0b0e" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#s)"/>
  <text x="56" y="250" font-family="F, Arial" font-size="15" fill="#ff8a94" letter-spacing="4">MM2 COMMUNITY</text>
  <text x="52" y="330" font-family="O, Arial Black" font-size="64" fill="#f5f5f7" letter-spacing="2">MM2<tspan fill="#e11d2e">SHARK</tspan></text>
  <text x="56" y="380" font-family="F, Arial" font-size="20" fill="#b8bcc8">Values · Trades · Updates</text>
</svg>`)

  const composed = await sharp(bg)
    .composite([
      { input: chroma, left: 720, top: 70 },
      { input: shark, left: 560, top: 160 },
      { input: fang, left: 780, top: 320 },
      { input: type, left: 0, top: 0 },
    ])
    .png()
    .toBuffer()

  const png = path.join(OUT, 'banner-960x540.png')
  const webp = path.join(OUT, 'banner-960x540.webp')
  await sharp(composed).png({ compressionLevel: 9 }).toFile(png)
  await sharp(composed).webp({ quality: 90 }).toFile(webp)
  console.log(`Wrote ${png} (${fs.statSync(png).size} bytes)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
