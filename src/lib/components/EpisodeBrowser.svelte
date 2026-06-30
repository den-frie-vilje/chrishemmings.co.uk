<!--
  Podcast episode browser. One sticky "now playing" panel (artwork above
  the title + metadata, excerpt, the audio player) beside a compact list of
  episodes (title + duration), grouped into in-list season accordions when
  the feed spans more than one season. Clicking a row selects that episode
  and plays it — so the page stays short instead of repeating a player per
  episode. Episode titles wrap (Chris's titles run long).
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import { groupBySeason } from '$lib/podcast';
  import AudioPlayer from '$lib/components/AudioPlayer.svelte';

  let { episodes }: { episodes: Episode[] } = $props();

  // Track the selection by guid so `selected` stays derived (reactive to
  // `episodes`); defaults to the first/latest episode.
  let selectedGuid = $state<string | null>(null);
  let playKey = $state(0);

  const selected = $derived(episodes.find((e) => e.guid === selectedGuid) ?? episodes[0]);
  const seasons = $derived(groupBySeason(episodes));
  const useSeasons = $derived(seasons.length > 1);

  function select(ep: Episode) {
    selectedGuid = ep.guid;
    playKey += 1;
  }
</script>

<div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
  <!-- Now playing — sticky while the list scrolls. Cover sits above the
       title so long titles have full width to wrap. -->
  <div class="lg:sticky lg:top-24 lg:self-start">
    <article class="rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-7">
      <p class="t-eyebrow !text-orange-700">Now playing</p>
      <img
        src={selected.image}
        alt=""
        width="200"
        height="200"
        class="mt-4 h-40 w-40 rounded-xl object-cover"
      />
      <p class="mt-4 text-sm text-ink-soft">
        {selected.dateLabel}{#if selected.durationLabel}&nbsp;·&nbsp;{selected.durationLabel}{/if}
      </p>
      <h3 class="t-h3 mt-1 text-balance text-navy-900">{selected.title}</h3>

      {#if selected.excerpt}
        <p class="mt-3 text-[0.97rem] leading-relaxed text-ink-soft">{selected.excerpt}</p>
      {/if}

      {#if selected.audioUrl}
        <div class="mt-5">
          <AudioPlayer src={selected.audioUrl} durationLabel={selected.durationLabel} {playKey} />
        </div>
      {/if}

      <a
        class="mt-5 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
        href={selected.link}
        target="_blank"
        rel="noopener"
      >
        Show notes on Acast →
      </a>
    </article>
  </div>

  <!-- Compact episode list. -->
  <div>
    {#snippet row(ep: Episode)}
      {@const active = ep.guid === selected.guid}
      <li>
        <button
          type="button"
          onclick={() => select(ep)}
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
          <span class="min-w-0 flex-1 text-[0.97rem] font-medium leading-snug {active ? 'text-orange-700' : 'text-navy-900'}">
            {ep.title}
          </span>
          {#if ep.durationLabel}
            <span class="mt-0.5 shrink-0 text-sm tabular-nums text-ink-soft">{ep.durationLabel}</span>
          {/if}
        </button>
      </li>
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
          <ul class="pb-2">
            {#each s.episodes as ep (ep.guid)}{@render row(ep)}{/each}
          </ul>
        </details>
      {/each}
    {:else}
      <ul>
        {#each episodes as ep (ep.guid)}{@render row(ep)}{/each}
      </ul>
    {/if}
  </div>
</div>
