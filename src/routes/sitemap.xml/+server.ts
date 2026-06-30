/**
 * sitemap.xml — single-locale. Lists the crawlable content pages.
 * `/admin` is excluded (noindex editor). `prerender = true` bakes it
 * into the static build.
 */
import type { RequestHandler } from './$types';
import { absUrl } from '$lib/seo/structured-data';

export const prerender = true;

interface Entry {
  path: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

const PAGES: Entry[] = [
  { path: '/', changefreq: 'monthly', priority: 1.0 },
  { path: '/working-together', changefreq: 'monthly', priority: 0.9 },
  { path: '/public-speaking', changefreq: 'monthly', priority: 0.8 },
  { path: '/podcast', changefreq: 'weekly', priority: 0.7 },
  { path: '/get-in-touch', changefreq: 'yearly', priority: 0.5 }
];

export const GET: RequestHandler = () => {
  const lastmod = '2026-06-30';

  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${absUrl(p.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`
  ).join('\n');

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
};
