<!--
  Podcast episode list. Grouped into in-list season accordions when the feed
  spans more than one season; each list shows the five most recent with a
  "load more". Clicking a row plays it in the sitewide bottom player. Titles
  are split at the first dash — lead bold, descriptive tail lighter.
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import { groupBySeason } from '$lib/podcast';
  import EpisodeRow from '$lib/components/EpisodeRow.svelte';
  import ChevronIcon from '$lib/components/ChevronIcon.svelte';

  let { episodes }: { episodes: Episode[] } = $props();

  const seasons = $derived(groupBySeason(episodes));
  const useSeasons = $derived(seasons.length > 1);

  const LIMIT = 5;
  let expanded = $state<Record<string, boolean>>({});
  const visible = (eps: Episode[], key: string) => (expanded[key] ? eps : eps.slice(0, LIMIT));
</script>

<div>
  {#snippet loadMore(eps: Episode[], key: string)}
    {#if eps.length > LIMIT && !expanded[key]}
      <button
        type="button"
        onclick={() => (expanded[key] = true)}
        class="mt-3 text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
      >
        Load {eps.length - LIMIT} more episode{eps.length - LIMIT === 1 ? '' : 's'}
      </button>
    {/if}
  {/snippet}

  {#if useSeasons}
    {#each seasons as s, i (s.number)}
      <details class="group" open={i === 0}>
        <summary
          class="flex cursor-pointer list-none items-center justify-between gap-4 border-t-2 border-line py-4 marker:hidden {i ===
          0
            ? ''
            : 'mt-2'}"
        >
          <span class="text-[1.2rem] font-bold tracking-[-0.01em] text-navy-900">Season {s.number}</span>
          <span class="flex items-center gap-2 text-sm text-ink-soft">
            {s.episodes.length} episode{s.episodes.length === 1 ? '' : 's'}
            <ChevronIcon class="h-4 w-4 transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <ul class="pb-1">
          {#each visible(s.episodes, s.number) as ep (ep.guid)}<EpisodeRow {ep} />{/each}
        </ul>
        {@render loadMore(s.episodes, s.number)}
      </details>
    {/each}
  {:else}
    <ul>
      {#each visible(episodes, 'all') as ep (ep.guid)}<EpisodeRow {ep} />{/each}
    </ul>
    {@render loadMore(episodes, 'all')}
  {/if}
</div>
