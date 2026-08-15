import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'discord')
fs.mkdirSync(OUT, { recursive: true })

const size = 512
const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="48%" r="52%">
      <stop offset="0%" stop-color="#e11d2e" stop-opacity="0.28"/>
      <stop offset="70%" stop-color="#e11d2e" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#e11d2e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#0a0a0c"/>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <g transform="translate(${size * 0.5} ${size * 0.52}) scale(${size / 78}) translate(-32 -32)">
    <path d="M12 48c6-2 14-10 18-22 1.2-3.6 2-8.2 2.2-12.8.05-1.2 1.5-1.7 2.3-.8 4.8 5.4 12.2 16.6 16.2 25.2 1.6 3.4-0.2 7.4-3.8 8.6L18.5 54.4C14.2 55.8 10.2 52.6 12 48z" fill="#e11d2e"/>
    <path d="M30.5 16.2c.4 5.2-.2 10.6-1.8 15.2-2.8 8.2-8.4 15.2-14.8 18.4" fill="none" stroke="#8a0f1a" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>
    <path d="M34 22c4.6 6.8 10.2 15.2 13.6 21.2" fill="none" stroke="#ff5a66" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>
  </g>
</svg>`)

const png = path.join(OUT, 'icon-512.png')
await sharp(svg).png().toFile(png)
await sharp(svg).webp({ quality: 90 }).toFile(path.join(OUT, 'icon-512.webp'))
console.log('Wrote', png, fs.statSync(png).size, 'bytes')
