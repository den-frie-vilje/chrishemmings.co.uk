<!--
  Public-site chrome (header + footer). Lives in the `(site)` route group
  so the editor routes outside it — /admin and /publish — render bare,
  without the nav bar or footer.
-->
<script lang="ts">
  import { onNavigate, afterNavigate } from '$app/navigation';
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import BottomPlayer from '$lib/components/BottomPlayer.svelte';
  import { player } from '$lib/player.svelte';

  let { children } = $props();

  // Smooth scrolling is for INTRA-page hash navigation only. The global CSS
  // `scroll-behavior: smooth` also animates SvelteKit's built-in scroll reset
  // on cross-page navigation (the router scrolls to 0,0 — see kit docs, link
  // options § data-sveltekit-noscroll) — a slow, janky crawl to the top on
  // every page change, especially on low-end mobiles. Gate it: when the
  // pathname changes, stamp <html data-instant-scroll> so the reset jumps
  // (app.css flips scroll-behavior to auto); same-pathname hash navigations
  // keep the smooth scroll. Cleared after the post-navigation paint (double
  // rAF, so the router's scroll work is definitely done).
  onNavigate((nav) => {
    if (nav.to?.url.pathname !== nav.from?.url.pathname) {
      document.documentElement.setAttribute('data-instant-scroll', '');
    }
  });
  afterNavigate(() => {
    const clear = () => document.documentElement.removeAttribute('data-instant-scroll');
    // Double rAF: past the post-navigation paint (and the router's scroll
    // reset) in a visible tab. rAF never fires in a hidden tab, so a timeout
    // backstop guarantees the gate always lifts (the reset itself is
    // synchronous, well inside 300ms).
    requestAnimationFrame(() => requestAnimationFrame(clear));
    setTimeout(clear, 300);
  });
</script>

<a
  href="#main"
  class="sr-only z-[100] rounded bg-navy-900 px-4 py-2 font-medium text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
>
  Skip to content
</a>

<div class="flex min-h-dvh flex-col {player.current ? 'pb-[60px]' : ''}">
  <SiteHeader />
  <main id="main" tabindex="-1" class="flex-1 scroll-mt-20 focus:outline-none">
    {@render children()}
  </main>
  <SiteFooter />
</div>

<BottomPlayer />
