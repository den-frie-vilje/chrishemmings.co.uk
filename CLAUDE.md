# Chris Hemmings — Project Guidelines

Static marketing site for **Chris Hemmings**, a UK psychotherapist & coach for men
(based in Copenhagen, serving the UK, Europe and worldwide, online). Rebuilt off Wix
as an owned, self-hostable SvelteKit static site.

## Working style

Follows **Den Frie Vilje** conventions: verify by measurement (`getComputedStyle` /
`getBoundingClientRect` / real numbers), never by eyeballing screenshots; prefer
subagents for multi-file research; binaries via `pkgx`; TypeScript everywhere (no stray
`.mjs`/`.js`); RTFM third-party components before integrating.

## Audience (drives design)

Primary: a broad church of UK men, mostly middle income — mainstream and inclusive,
**not** upmarket. Warm, plain, non-clinical, portrait-led, fee-transparent. Secondary:
companies booking Chris as a **public speaker** (more professional register, distinct
"Enquire about speaking" CTA). Discipline: **keep the bright orange to CTAs/accents**;
keep it inclusive, not luxury.

## Stack

- SvelteKit 5 (runes) + `@sveltejs/adapter-static` — fully prerendered, single-locale (English).
- Tailwind v4; design tokens in the `@theme` block of `src/app.css` (MTH-derived palette +
  Hanken Grotesk / Newsreader). No Three.js, no i18n routing.
- `marked` for first-party markdown; `DOMPurify` for the third-party podcast feed.
- Sveltia CMS at `/admin` (GitHub backend, self-hosted bundle).

## Commands (always via pkgx)

```sh
pkgx pnpm install
pkgx pnpm dev       # vite on :5173
pkgx pnpm build     # static → build/  (prebuild: Sveltia bundle + OG cards + responsive photos)
pkgx pnpm check     # svelte-check + tsc — RUN BEFORE PUSHING (CI runs it before build)
```

## Content model (markdown-first)

All copy lives in `src/content/*.json`, typed + loaded via `src/lib/content`. **Prose fields
are markdown strings** (rendered with `$lib/markdown` → `<Prose>`), not arrays of bullets —
reserve arrays for genuine lists (nav, interests, qualifications, talks, platforms). Sveltia
edits these via `static/admin/config.yml` (markdown widget on prose fields). Add a page: new
`src/content/<page>.json` + type in `src/lib/content/index.ts` + a route + a `config.yml` entry.
Sitewide lists (`testimonials`, `accolades`) live in the CMS **General** collection, not
per-page — reused across pages (e.g. accolades on home + speaking via `Accolades.svelte`).

## Podcast page (`/podcast`)

Episodes load **client-side** from Acast (show "No Man's an Island"). The browser fetches the
**same-origin** path `/api/podcast-feed` — in prod the front-door **Caddy reverse-proxies** it
to `feeds.acast.com` (Acast sends no CORS headers); under `vite dev`/`preview` the
`src/routes/api/podcast-feed/+server.ts` endpoint does the same. Cloudflare edge-caches the
proxied feed (`s-maxage=3600`). The show id lives in **both** the Caddyfiles and the dev
endpoint — keep them in sync. Feed parsing + DOMPurify sanitising: `src/lib/podcast.ts`.

## Responsive images (`Photo.svelte`)

Photographs live in `static/img/photos/` — **the folder is the opt-in**; logos, badges and
graphics elsewhere stay plain `<img>`/SVG. At build (`prebuild` → `scripts/gen-photos.ts`) each
becomes AVIF/WebP `srcset` widths rendered by `<Photo>` (a `<picture>` with `display:contents`,
so `w-full`/aspect classes behave like a bare `<img>`). A too-small source is first **AI-upscaled**
(UpscalerJS `upscaler/node` + `@tensorflow/tfjs-node`, `esrgan-thick` 4×) — this runs on CI
(linux/amd64); macOS has no tfjs-node prebuild so local builds fall back to a sharp Lanczos
upscale and never break. Content-hash **gated**: unchanged photos aren't reprocessed. Committed
variants + `src/lib/photo-manifest.json` ship, so the deploy build does no image work unless a
photo changed. Refresh AI masters from a Mac: `pnpm photos:ci` (runs the generator in a
linux/amd64 container). CMS photo fields upload to `/img/photos`. Use `<Photo>` **only** for
photographs. (`@tensorflow/tfjs-node` is an `optionalDependency` with a `pnpm.onlyBuiltDependencies`
approval; tfjs-node 4.x needs the `util.is*` shim in gen-photos on Node ≥24.)

## Deploy

Shared nas-sites pull-only CD (cosign-verified GHCR image). `deploy/` holds the Dockerfile
(pkgx builder → rootless nginx), nginx.conf, Caddyfile.{production,staging}, compose files;
`.github/workflows/deploy-{production,staging}.yml` build + sign. `/admin` is stripped from the
production image (`STRIP_EDITOR=true`); the editor + GitHub OAuth proxy run on staging only.

## Conventions

- Svelte 5 runes only (`$props`, `$state`, `$derived`). Don't name a variable `state` (clashes
  with the `$state` rune).
- Unlinked endpoint routes must be listed in `svelte.config.js` `prerender.entries`. `robots.txt`
  is a plain `static/` file (a `.txt` route entry is skipped by the prerender crawler).
- Verify contrast by computing WCAG ratios (a small Node script) — every orange-on-X pair must
  pass AA; the bright `orange-500` only meets AA on navy, so on light grounds use `orange-700`.
