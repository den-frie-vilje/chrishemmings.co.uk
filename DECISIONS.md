# Decisions (ADRs)

Append-only log of non-obvious choices. Newest at the bottom.

## 1. Fresh scaffold, not clone-and-prune
Built a fresh SvelteKit skeleton rather than copying the skovbyesexologi.com repo and
deleting. The design language is deliberately different (no Three.js, single-locale), so
copied components/CSS would be rewritten anyway while importing residual risk (3D wiring,
bilingual routing, stray names). Only the **generic infra** (deploy/, workflows, pkgx,
copy-sveltia, admin host) was lifted verbatim and renamed. A residuals audit (grep for
skovbye/three/locale) gated the first commit.

## 2. Single-locale (English only)
All source content is English; Chris serves the UK + internationally (not Denmark-specific).
Dropped the bilingual `[[lang=locale]]` routing entirely.

## 3. Hybrid IA
Rich single-page home + deep pages (`/working-together`, `/public-speaking`) + `/podcast` +
a light `/get-in-touch`. Two distinct CTAs separate the audiences: "Book a free 15-minute
consultation" (therapy) vs "Enquire about speaking" (companies).

## 4. Markdown-first content
Content is JSON, but every prose field is a **markdown string** (rendered via `marked`), not
an array of bullets — a deliberate correction of the over-bulleted shape a JSON-array model
produced on a previous site. Structured arrays only for genuine lists.

## 5. Podcast: client-side fetch via same-origin proxy (pure static kept)
The Acast public RSS feed has no CORS headers (preflight 403), so a direct browser fetch is
blocked. Rather than a build-time fetch (stale until rebuild) or a node-adapter BFF (needs a
server), the browser fetches a **same-origin** `/api/podcast-feed` that Caddy reverse-proxies
to Acast — live, no secret, the build stays fully static. Cloudflare edge-caches it
(`s-maxage=3600`) so Acast is hit ~once/hour, not per visitor.

## 6. Palette + typography from the MTH reference
Navy `#093449` / warm paper `#F4F1EA` / orange `#FF9902` + Hanken Grotesk (with Newsreader
serif for pull-quotes). Bright `orange-500` only passes WCAG AA on navy; on light grounds the
darker `orange-700 #9a4e05` is used (tile numbers, quiet links) — verified by computing
contrast ratios.

## 7. Verbatim content migration with light typo fixes
Copy was migrated verbatim from the Wix site, fixing only obvious errors ("I combines" →
"I combine", "person-centered" → UK "person-centred"). Source dump: `docs/content-scrape.md`.

## 8. robots.txt as a static file
SvelteKit's prerender crawler skips a `.txt` route entry (treats it as a static asset), so
`robots.txt` is a plain file in `static/`. `sitemap.xml` remains a prerendered endpoint route
(listed in `prerender.entries`).

## 9. Responsive images: AI-upscale in CI → sharp srcset, hash-gated
Photographs (only — folder-scoped to `static/img/photos/`; logos/graphics elsewhere untouched)
become AVIF/WebP `srcset`s at build (`scripts/gen-photos.ts` → `<Photo>`). A too-small source is
first AI-upscaled with UpscalerJS (`upscaler/node` + `@tensorflow/tfjs-node`, `esrgan-thick` 4×)
*in CI*, then sharp downscales to widths. Verified against the real linux/amd64 deploy image;
macOS has no tfjs-node prebuild so local builds fall back to sharp Lanczos and never break.
Committed variants + `photo-manifest.json` are content-hash-gated (unchanged photos aren't
reprocessed). Rejected *client-side* UpscalerJS — the blurry→sharp swap can't avoid a blink
without a transition, and TF.js weight hurts LCP; `srcset` delivers, the upscaler *feeds* it
offline. Refresh AI masters from a Mac with `pnpm photos:ci` (linux/amd64 container).

## 10. Accolades as a sitewide list, not a page field
Third-party recognitions (e.g. the CPRMB "Men & Boys Champion") are a CMS **General**-collection
list (`src/content/accolades.json` + `Accolades.svelte`), sister to testimonials — shown under
the home founder block and on the speaking page (editorial Newsreader-serif treatment, no
name-dropping of the list). Replaced the single `site.recognition` field so Chris can add more
himself.
