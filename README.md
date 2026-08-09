# MM2Shark

Murder Mystery 2 value list + trade calculator. Values sync from [Traderie](https://traderie.com/mm2/values).

## Local

```sh
npm install
npm run dev
npm run build
npm run sync:values   # refresh items/sets from Traderie
```

## Cloudflare Pages + GitHub

1. Create a GitHub repo and push this project (`main`).
2. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo  
   **or** use the GitHub Action below.
3. Build settings (if using CF Git integration):
   - Framework: Astro (or None)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node: `22`
4. For GitHub Actions deploy, add repo secrets:
   - `CLOUDFLARE_API_TOKEN` — token with **Account → Cloudflare Pages → Edit**
   - `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard URL / overview
5. Custom domain: Pages project → **Custom domains** → `mm2shark.com` (+ `www` if you want).  
   Point DNS to Cloudflare (nameservers or CNAME to `*.pages.dev`).

`sync-values` workflow runs every 5 hours, commits Traderie updates to `main`, then `Deploy` rebuilds the site.
