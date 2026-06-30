<!--
  Chevron-down glyph (rounded). `currentColor`; pass size/rotation via
  `class` (e.g. `h-4 w-4 group-open:rotate-180`). Single source for the
  disclosure affordance shared by the season accordion and the player.
-->
<script lang="ts">
  let { class: klass = '' }: { class?: string } = $props();
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class={klass}>
  <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
</svg>
