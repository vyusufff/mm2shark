/**
 * Convert public/items images to ~96px WebP and point JSON image fields at .webp.
 * Safe to re-run. Keeps originals if conversion fails.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const ITEMS_DIR = path.join(ROOT, 'public', 'items')
const JSON_PATHS = [
  path.join(ROOT, 'src', 'data', 'items.json'),
  path.join(ROOT, 'src', 'data', 'sets.json'),
  path.join(ROOT, 'public', 'data', 'items.json'),
  path.join(ROOT, 'public', 'data', 'sets.json'),
]

const EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!EXTS.has(ext)) return null
  const base = filePath.slice(0, -ext.length)
  const out = `${base}.webp`
  const input = sharp(filePath, { failOn: 'none' }).rotate()
  const meta = await input.metadata()
  const size = Math.min(96, meta.width || 96, meta.height || 96)
  await input
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(out + '.tmp')
  fs.renameSync(out + '.tmp', out)
  return out
}

function rewriteJson(filePath) {
  // Keep JSON on original png/jpg paths — Cloudflare has been caching HTML
  // fallbacks for missing/poisoned .webp URLs. WebP files can still be generated
  // for future use; ValueList/Calculator should keep using the source paths.
  return 0
}

const files = fs.readdirSync(ITEMS_DIR)
let converted = 0
let skipped = 0
for (const name of files) {
  const full = path.join(ITEMS_DIR, name)
  if (!fs.statSync(full).isFile()) continue
  const ext = path.extname(name).toLowerCase()
  if (!EXTS.has(ext) || ext === '.webp') {
    // refresh existing webp to 96px if huge? skip for speed
    if (ext === '.webp') skipped++
    continue
  }
  const webpPath = full.replace(/\.(png|jpe?g|gif)$/i, '.webp')
  try {
    // Re-encode if missing or source newer
    if (
      !fs.existsSync(webpPath) ||
      fs.statSync(full).mtimeMs > fs.statSync(webpPath).mtimeMs
    ) {
      await convertFile(full)
      converted++
      if (converted % 100 === 0) console.log(`  ${converted}…`)
    } else {
      skipped++
    }
  } catch (err) {
    console.warn('fail', name, err.message)
  }
}

let rewritten = 0
for (const p of JSON_PATHS) rewritten += rewriteJson(p)

console.log(`WebP: converted=${converted} skipped=${skipped} jsonPathsUpdated=${rewritten}`)
