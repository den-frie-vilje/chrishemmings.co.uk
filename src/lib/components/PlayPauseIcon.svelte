<!--
  Play / pause glyph. `currentColor` so it inherits the control's text
  colour; `size` matches the call site (26 in the players, 14 for the
  logo-marquee toggle). Single source for what used to be seven inlined,
  already-drifted copies of these two SVGs.
-->
<script lang="ts">
  interface Props {
    /** Show the pause bars (true) or the play triangle (false). */
    playing?: boolean;
    /** Pixel size of the square icon. */
    size?: number;
    class?: string;
  }
  let { playing = false, size = 26, class: klass = '' }: Props = $props();
</script>

{#if playing}
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" class={klass}>
    <rect x="7" y="5" width="3.6" height="14" rx="0.5" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="0.5" />
  </svg>
{:else}
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" class={klass}>
    <path d="M8 5v14l11-7z" />
  </svg>
{/if}
