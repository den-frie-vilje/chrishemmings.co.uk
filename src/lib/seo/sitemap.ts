/**
 * Filesystem-derived sitemap.xml — zero per-page configuration. Liftable to
 * any prerendered SvelteKit site: copy this file + the /sitemap.xml/+server.ts
 * endpoint (and keep the endpoint in `prerender.entries`; nothing links to it).
 *
 * The URL list is every `+page.svelte` under src/routes, minus
 *   - routes disallowed for all agents in static/robots.txt (e.g. /admin/);
 *   - pages whose own source declares `<meta name="robots" … noindex …>` —
 *     a noindexed URL must not be advertised in a sitemap;
 *   - dynamic routes ([param]) — nothing generic can enumerate those; pass
 *     their concrete URLs via `extraPaths` from the endpoint.
 *
 * Entries are `<loc>`-only, which is all the spec requires: Google ignores
 * `<changefreq>`/`<priority>` entirely, and honours `<lastmod>` only when it
 * is "consistently and verifiably accurate" — which a hand-maintained date or
 * a whole-site build stamp is not. Omitting beats lying.
 */
import { absUrl } from '$lib/seo/structured-data';
import robotsTxt from '../../../static/robots.txt?raw';

const pageSources = import.meta.glob('/src/routes/**/+page.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

/** Disallow prefixes that apply to every crawler (the `User-agent: *` group). */
function globalDisallows(robots: string): string[] {
  const rules: string[] = [];
  let forAll = false;
  for (const raw of robots.split('\n')) {
    const line = raw.replace(/#.*$/, '').trim();
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (!value && key.toLowerCase() !== 'disallow') continue;
    switch (key.toLowerCase()) {
      case 'user-agent':
        forAll = value === '*';
        break;
      case 'disallow':
        if (forAll && value) rules.push(value);
        break;
    }
  }
  return rules;
}

/** `/src/routes/(site)/foo/+page.svelte` → `/foo`; group segments drop out. */
function routePath(file: string): string {
  const path = file
    .replace(/^\/src\/routes/, '')
    .replace(/\/\+page\.svelte$/, '')
    .split('/')
    .filter((seg) => seg && !(seg.startsWith('(') && seg.endsWith(')')))
    .join('/');
  return '/' + path;
}

const NOINDEX = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i;

export function sitemapPaths(extraPaths: string[] = []): string[] {
  const disallows = globalDisallows(robotsTxt);
  const paths = Object.entries(pageSources)
    .filter(([file]) => !file.includes('['))
    .filter(([, source]) => !NOINDEX.test(source))
    .map(([file]) => routePath(file))
    .filter((path) => !disallows.some((rule) => (path + '/').startsWith(rule)));
  return [...new Set([...paths, ...extraPaths])].sort();
}

export function sitemapResponse(extraPaths: string[] = []): Response {
  const urls = sitemapPaths(extraPaths)
    .map((path) => `  <url>\n    <loc>${absUrl(path)}</loc>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}
