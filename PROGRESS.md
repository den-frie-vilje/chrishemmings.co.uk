# Progress journal

## 2026-06-30 — Initial build
- Scraped the Wix site verbatim → `docs/content-scrape.md` (4 pages, fees, credentials, assets).
- Fresh SvelteKit 5 + adapter-static + Tailwind v4 scaffold; lifted nas-sites deploy infra
  (Dockerfile, nginx, Caddy, compose, GHA workflows) and renamed off skovbye.
- Design system from the MTH reference (navy/paper/orange + Hanken Grotesk/Newsreader).
- Markdown-first content model (`src/content/*.json` + `$lib/content` + `<Prose>`).
- Pages: home (hybrid), working-together, public-speaking, get-in-touch, podcast.
- Podcast: client-side fetch of the Acast "No Man's an Island" feed via a same-origin
  Caddy proxy (`/api/podcast-feed`) with a dev endpoint; Cloudflare edge-cache headers.
  Verified 38 episodes render with native audio + sanitised descriptions.
- Sveltia CMS at `/admin` (single-locale, markdown-widget config).
- Acquired portraits / badges / logos from the Wix CDN; branded OG + favicon.
- Verified: `pnpm check` clean, `pnpm build` prerenders all routes; WCAG AA contrast
  computed for every colour pair (fixed tile-number to `orange-700`); residuals audit clean.

## Open / follow-ups
- Confirm the GitHub repo path (`den-frie-vilje/chrishemmings.co.uk`) + create the
  `production-gate`/`production`/`staging` environments and the staging OAuth proxy.
- Decide the consultation booking mechanism (currently mailto) — Calendly/Cal.com/form?
- Optional: source official **vector** BACP / PSA / MTH / M-Path logos (currently Wix rasters).
- Optional: tune hero portrait crop focus on very wide viewports.
