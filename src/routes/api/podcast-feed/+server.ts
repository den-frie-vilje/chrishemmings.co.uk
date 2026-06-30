/**
 * Same-origin proxy for the Acast podcast feed — DEV/PREVIEW ONLY.
 *
 * The `/podcast` page fetches this path in the browser. The Acast feed
 * sends no CORS headers (and 403s preflight), so a direct browser fetch
 * is blocked; routing through a same-origin path removes the
 * cross-origin nature entirely.
 *
 * In PRODUCTION the site is a static (adapter-static) deploy where this
 * server route does NOT execute — the front-door Caddy reverse-proxies
 * `/api/podcast-feed` straight to the Acast feed (and Cloudflare edge-
 * caches it). See deploy/Caddyfile.*. This handler exists so the same
 * URL works under `vite dev` / `vite preview` without Caddy.
 *
 * Keep the SHOW_ID here in sync with the Caddy proxy target.
 */
import type { RequestHandler } from './$types';

export const prerender = false;

const FEED_URL = 'https://feeds.acast.com/public/shows/6900923adc92bdfeedb4e174';

export const GET: RequestHandler = async ({ fetch }) => {
  const upstream = await fetch(FEED_URL);

  if (!upstream.ok) {
    return new Response(`Upstream feed error: ${upstream.status}`, {
      status: 502,
      headers: { 'cache-control': 'no-store' }
    });
  }

  const xml = await upstream.text();
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      // Mirror the production Caddy/Cloudflare intent: short browser TTL,
      // serve-stale on upstream error.
      'cache-control': 'public, max-age=300, stale-if-error=1200'
    }
  });
};
