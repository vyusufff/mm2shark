/**
 * Compose public/og.png from real MM2 item PNGs + brand type.
 * Run: node scripts/make_og.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const ITEMS = path.join(ROOT, 'public', 'items')
const FONTS = path.join(ROOT, 'public', 'fonts')
const OUT = path.join(ROOT, 'public', 'og.png')

const W = 1200
const H = 630

function fontDataUri(filename) {
  const buf = fs.readFileSync(path.join(FONTS, filename))
  return `data:font/ttf;base64,${buf.toString('base64')}`
}

async function itemLayer(file, size, rotate = 0) {
  const src = path.join(ITEMS, file)
  if (!fs.existsSync(src)) throw new Error(`Missing ${file}`)

  let pipeline = sharp(src, { failOn: 'none' })
    .ensureAlpha()
    .resize(size, size, { fit: 'inside', kernel: sharp.kernel.lanczos3 })

  if (rotate) {
    pipeline = pipeline.rotate(rotate, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  }

  const img = await pipeline.png().toBuffer()
  const meta = await sharp(img).metadata()
  const iw = meta.width
  const ih = meta.height
  const pad = 40
  const cw = iw + pad * 2
  const ch = ih + pad * 2

  const alpha = await sharp(img).extractChannel('alpha').toBuffer()
  const softAlpha = await sharp(alpha).blur(20).toBuffer()
  const black = await sharp({
    create: { width: iw, height: ih, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .joinChannel(softAlpha)
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: cw,
      height: ch,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: black, left: pad + 2, top: pad + 14 },
      { input: img, left: pad, top: pad },
    ])
    .png()
    .toBuffer()
}

async function main() {
  const oswald700 = fontDataUri('oswald-700.ttf')
  const oswald500 = fontDataUri('oswald-500.ttf')
  const figtree = fontDataUri('figtree-600.ttf')

  const bg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0d"/>
      <stop offset="100%" stop-color="#090508"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="48%" r="46%">
      <stop offset="0%" stop-color="#e11d2e" stop-opacity="0.26"/>
      <stop offset="50%" stop-color="#e11d2e" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#e11d2e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#base)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`)

  // Loose diagonal scatter (like promo art) — smaller, spaced
  const [seer, chroma, shark, fang, luger] = await Promise.all([
    itemLayer('seer-knife.png', 168, -16),
    itemLayer('chroma-shark-gun.png', 188, 10),
    itemLayer('shark-gun.png', 210, -4),
    itemLayer('fang-knife.png', 176, 12),
    itemLayer('luger-gun.png', 170, -8),
  ])

  const type = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#090508" stop-opacity="0.94"/>
      <stop offset="40%" stop-color="#090508" stop-opacity="0.62"/>
      <stop offset="58%" stop-color="#090508" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#090508" stop-opacity="0"/>
    </linearGradient>
    <style type="text/css"><![CDATA[
      @font-face { font-family: 'OswaldBold'; src: url('${oswald700}'); }
      @font-face { font-family: 'OswaldMed'; src: url('${oswald500}'); }
      @font-face { font-family: 'FigtreeSemi'; src: url('${figtree}'); }
    ]]></style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>

  <text x="88" y="238"
    font-family="FigtreeSemi, Arial, Helvetica, sans-serif"
    font-size="16"
    fill="#ff8a94"
    letter-spacing="5">FOR NIKILIS' MURDER MYSTERY 2</text>

  <text x="84" y="336"
    font-family="OswaldBold, Impact, Arial Black, sans-serif"
    font-size="74"
    fill="#f5f5f7"
    letter-spacing="2">MM2<tspan fill="#e11d2e">SHARK</tspan>.COM</text>

  <text x="88" y="400"
    font-family="OswaldMed, Arial, Helvetica, sans-serif"
    font-size="26"
    fill="#cfd2da"
    letter-spacing="3.5">VALUE LIST &amp; TRADE CALCULATOR</text>
</svg>`)

  if (fs.existsSync(OUT)) fs.unlinkSync(OUT)

  await sharp(bg)
    .composite([
      { input: seer, left: 620, top: 48 },
      { input: chroma, left: 900, top: 42 },
      { input: shark, left: 740, top: 210 },
      { input: fang, left: 600, top: 400 },
      { input: luger, left: 920, top: 390 },
      { input: type, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(OUT)

  const meta = await sharp(OUT).metadata()
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${meta.width}×${meta.height}, ${fs.statSync(OUT).size} bytes)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
