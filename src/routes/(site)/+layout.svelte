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

<div class="flex min-h-dvh flex-col">
  <SiteHeader />
  <main class="flex-1">
    {@render children()}
  </main>
  <SiteFooter />
</div>
