<!--
  Podcast episode list. Grouped into in-list season accordions when the feed
  spans more than one season; each list shows the five most recent with a
  "load more". Clicking a row plays it in the sitewide bottom player. Titles
  are split at the first dash — lead bold, descriptive tail lighter.
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import { groupBySeason, splitTitle } from '$lib/podcast';
  import { player, playEpisode } from '$lib/player.svelte';

  let { episodes }: { episodes: Episode[] } = $props();

  const seasons = $derived(groupBySeason(episodes));
  const useSeasons = $derived(seasons.length > 1);

  const LIMIT = 5;
  let expanded = $state<Record<string, boolean>>({});
  const visible = (eps: Episode[], key: string) => (expanded[key] ? eps : eps.slice(0, LIMIT));
</script>

<div>
  {#snippet row(ep: Episode)}
    {@const active = player.current?.guid === ep.guid}
    {@const t = splitTitle(ep.title)}
    <li>
      <button
        type="button"
        onclick={() => playEpisode(ep)}
        aria-current={active ? 'true' : undefined}
        class="flex w-full items-start gap-3 border-t border-line py-4 pr-1 text-left transition-colors hover:bg-paper-2"
        class:bg-paper-2={active}
      >
        <span
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors {active
            ? 'border-orange-700 text-orange-700'
            : 'border-line text-ink-soft'}"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
        <span class="min-w-0 flex-1 text-[0.97rem] leading-snug {active ? 'text-orange-700' : ''}">
          <span class="font-semibold {active ? '' : 'text-navy-900'}">{t.head}</span><span
            class="font-normal {active ? '' : 'text-ink-soft'}">{t.tail}</span
          >
        </span>
        <span class="mt-0.5 hidden shrink-0 text-sm text-ink-soft md:block md:w-28 md:text-right">
          {ep.dateLabel}
        </span>
        <span class="mt-0.5 shrink-0 text-sm tabular-nums text-ink-soft md:w-14 md:text-right">
          {ep.durationLabel}
        </span>
      </button>
    </li>
  {/snippet}

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
            <svg
              class="h-4 w-4 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </summary>
        <ul class="pb-1">
          {#each visible(s.episodes, s.number) as ep (ep.guid)}{@render row(ep)}{/each}
        </ul>
        {@render loadMore(s.episodes, s.number)}
      </details>
    {/each}
  {:else}
    <ul>
      {#each visible(episodes, 'all') as ep (ep.guid)}{@render row(ep)}{/each}
    </ul>
    {@render loadMore(episodes, 'all')}
  {/if}
</div>
