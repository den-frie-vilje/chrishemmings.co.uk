import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // SPA-fallback shell for any route that opts out of prerender.
      // nginx's try_files falls through to /200.html for paths that
      // didn't prerender; prerendered routes still emit their own .html.
      fallback: '200.html',
      // Allow non-prerenderable routes without failing the static build.
      strict: false
    }),
    prerender: {
      // `*` crawls all reachable + static page routes. sitemap.xml is an
      // unlinked endpoint route, so list it explicitly. (robots.txt is a
      // plain static file in static/ — no route needed.)
      entries: ['*', '/sitemap.xml']
    }
  }
};

export default config;
