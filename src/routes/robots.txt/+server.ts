/**
 * robots.txt — per-environment content, prerendered at build time
 * (unlinked endpoint route; listed in svelte.config.js prerender.entries).
 *
 * Production build (PUBLIC_ALLOW_INDEXING=true in `.env.production`):
 * allow crawling, disallow the ROBOTS_DISALLOW paths, advertise the
 * sitemap — byte-identical to the static/robots.txt file this route
 * replaced.
 *
 * Staging + dev builds (PUBLIC_ALLOW_INDEXING=false): disallow
 * everything, no sitemap advert — staging URLs are duplicates of
 * production content and must never enter a search index. Belt-and-
 * braces with deploy/Caddyfile.staging's `X-Robots-Tag: noindex,
 * nofollow`: the baked file is the primary strap (it deploys atomically
 * with the image), the header is the backstop.
 *
 * `$env/static/public`, not dynamic — mode-file-sourced at build time
 * and loud on a missing declaration (see structured-data.ts for the
 * 2026-07-30 failure this guards against). Fail-closed on top: only the
 * literal "true" bakes the indexable variant.
 */
import type { RequestHandler } from './$types';
import { PUBLIC_ALLOW_INDEXING } from '$env/static/public';
import { SITE_URL } from '$lib/seo/structured-data';
import { ROBOTS_DISALLOW } from '$lib/seo/robots';

export const prerender = true;

export const GET: RequestHandler = () => {
  const allowIndexing = PUBLIC_ALLOW_INDEXING === 'true';

  const body = allowIndexing
    ? [
        'User-agent: *',
        'Allow: /',
        ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`),
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        ''
      ].join('\n')
    : [
        '# Staging build — not intended for search engines.',
        'User-agent: *',
        'Disallow: /',
        ''
      ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
