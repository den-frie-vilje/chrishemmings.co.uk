/**
 * Admin route — Sveltia CMS host.
 *
 * Sveltia manages its own client-side routing; disable CSR so SvelteKit
 * renders a pre-baked static host page and leaves the browser to
 * Sveltia. Prerender locks it into the static build.
 */
export const csr = false;
export const prerender = true;
// Emit `admin/index.html` (not `admin.html`) so the `/admin/` directory —
// which also holds the vendored Sveltia bundle (sveltia-cms.js, config.yml) —
// has a real index. Without this, nginx hits the index-less directory on
// `/admin/` and returns 403 instead of the editor.
export const trailingSlash = 'always';
