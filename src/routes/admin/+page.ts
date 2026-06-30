/**
 * Admin route — Sveltia CMS host.
 *
 * Sveltia manages its own client-side routing; disable CSR so SvelteKit
 * renders a pre-baked static host page and leaves the browser to
 * Sveltia. Prerender locks it into the static build.
 */
export const csr = false;
export const prerender = true;
