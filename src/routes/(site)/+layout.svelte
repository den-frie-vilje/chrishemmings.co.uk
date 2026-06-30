<!--
  Public-site chrome (header + footer). Lives in the `(site)` route group
  so the editor routes outside it — /admin and /publish — render bare,
  without the nav bar or footer.
-->
<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  let { children } = $props();
</script>

<a
  href="#main"
  class="sr-only z-[100] rounded bg-navy-900 px-4 py-2 font-medium text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
>
  Skip to content
</a>

<div class="flex min-h-dvh flex-col">
  <SiteHeader />
  <main id="main" tabindex="-1" class="flex-1 scroll-mt-20 focus:outline-none">
    {@render children()}
  </main>
  <SiteFooter />
</div>
