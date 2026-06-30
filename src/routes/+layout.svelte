<!--
  Root layout: global styles only. The header/footer chrome lives in the
  `(site)` group's layout, so editor routes (/admin, /publish) stay bare.
-->
<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

{@render children()}
