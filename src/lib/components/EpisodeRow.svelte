<!--
  One episode row (an <li> for a <ul>): play button, title split bold/regular
  at the dash, date + duration. Clicking plays it in the sitewide bottom
  player. Shared by the podcast page list and the home-page teaser.
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import { splitTitle } from '$lib/podcast';
  import { player, playEpisode } from '$lib/player.svelte';
  import PlayPauseIcon from '$lib/components/PlayPauseIcon.svelte';

  let { ep }: { ep: Episode } = $props();
  const active = $derived(player.current?.guid === ep.guid);
  const t = $derived(splitTitle(ep.title));
</script>

<li>
  <button
    type="button"
    onclick={() => playEpisode(ep)}
    aria-current={active ? 'true' : undefined}
    class="flex w-full items-center gap-3 border-t border-line py-4 pr-1 text-left transition-colors hover:bg-paper-2"
    class:bg-paper-2={active}
  >
    <span
      class="flex shrink-0 items-center justify-center transition-colors {active
        ? 'text-orange-700'
        : 'text-ink-soft'}"
      aria-hidden="true"
    >
      <PlayPauseIcon />
    </span>
    <span class="sr-only">{active ? 'Restart episode:' : 'Play episode:'}</span>
    <span class="min-w-0 flex-1 text-[0.97rem] leading-snug {active ? 'text-orange-700' : ''}">
      <span class="font-semibold {active ? '' : 'text-navy-900'}">{t.head}</span><span
        class="font-normal {active ? '' : 'text-ink-soft'}">{t.tail}</span
      >
    </span>
    <span class="hidden shrink-0 text-sm text-ink-soft md:block md:w-28 md:text-right">
      {ep.dateLabel}
    </span>
    <span class="shrink-0 text-sm tabular-nums text-ink-soft md:w-14 md:text-right">
      {ep.durationLabel}
    </span>
  </button>
</li>
