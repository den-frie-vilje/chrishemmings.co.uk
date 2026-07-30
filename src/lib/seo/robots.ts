/**
 * Crawler exclusions, single-sourced. These path prefixes are disallowed
 * for every crawler (the `User-agent: *` group) in the production
 * robots.txt AND filtered out of the derived sitemap — a path disallowed
 * here can never be advertised there. Consumed by
 * src/routes/robots.txt/+server.ts and $lib/seo/sitemap.
 */
export const ROBOTS_DISALLOW: readonly string[] = ['/admin/'];
