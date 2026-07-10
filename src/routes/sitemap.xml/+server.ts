/**
 * sitemap.xml — fully derived from the filesystem + robots.txt + per-page
 * noindex declarations; see $lib/seo/sitemap. `prerender = true` bakes it
 * into the static build (and svelte.config.js lists it in prerender.entries,
 * since no page links here).
 */
import type { RequestHandler } from './$types';
import { sitemapResponse } from '$lib/seo/sitemap';

export const prerender = true;

export const GET: RequestHandler = () => sitemapResponse();
