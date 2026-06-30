/**
 * The `/publish` page is the "push staging → production" button for the
 * editor. It's a CLIENT-side interactive page — it reads Sveltia's stored
 * OAuth token from localStorage and talks directly to the GitHub API
 * (compare + pulls endpoints). Nothing to prerender:
 *   • prerender off — fetches happen in the browser
 *   • csr on (default) — we need the reactive UI
 *
 * Not indexed (robots.txt Disallows /admin/ and a noindex meta ships in
 * the page head). Served via the adapter-static SPA fallback (200.html).
 */
export const prerender = false;
