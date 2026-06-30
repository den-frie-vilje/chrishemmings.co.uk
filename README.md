# chrishemmings.co.uk

Static marketing site for **Chris Hemmings** — UK psychotherapist & coach for men, public
speaker, and co-host of the *No Man's an Island* podcast.

SvelteKit 5 (runes) · adapter-static · Tailwind v4 · Sveltia CMS · self-hosted via the
nas-sites pull-only deploy model. See [CLAUDE.md](CLAUDE.md) for the full guide and
[DECISIONS.md](DECISIONS.md) for the rationale behind the key choices.

## Develop

```sh
pkgx pnpm install
pkgx pnpm dev       # http://localhost:5173
pkgx pnpm build     # static output → build/
pkgx pnpm check     # svelte-check + tsc (run before pushing)
```

## Structure

- `src/content/*.json` — all site copy (prose fields are markdown strings).
- `src/lib/` — content loader, markdown + podcast helpers, SEO, components.
- `src/routes/` — home, working-together, public-speaking, podcast, get-in-touch, admin.
- `static/` — images, robots.txt, Sveltia admin config.
- `deploy/` + `.github/workflows/` — Docker image, Caddy/nginx, signed CI deploy.

## Content editing

Editors use Sveltia CMS at `/admin` on staging (GitHub backend). Prose is edited as markdown.
