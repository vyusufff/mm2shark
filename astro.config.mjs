// @ts-check
import { defineConfig } from 'astro/config'

import react from '@astrojs/react';

// Static site → Cloudflare Pages (`dist`)
export default defineConfig({
  site: 'https://mm2shark.com',
  integrations: [react()],
})