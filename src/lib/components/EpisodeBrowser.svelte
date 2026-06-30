<!--
  Podcast episode browser. One "now playing" panel (artwork beside the
  date/duration/season, the audio player, excerpt) and a compact list of
  episodes (title + duration) grouped into in-list season accordions. Each
  list shows the five most recent episodes with a "load more". Clicking a
  row selects + plays it. On mobile, a compact sticky bar (title + playbar)
  appears under the nav once the full panel scrolls away — it drives the
  SAME audio element (bound out of AudioPlayer).
-->
<script lang="ts">
  import type { Episode } from '$lib/podcast';
  import { groupBySeason } from '$lib/podcast';
  import AudioPlayer from '$lib/components/AudioPlayer.svelte';

  let { episodes }: { episodes: Episode[] } = $props();

  let selectedGuid = $state<string | null>(null);
  let playKey = $state(0);

  const selected = $derived(episodes.find((e) => e.guid === selectedGuid) ?? episodes[0]);
  const seasons = $derived(groupBySeason(episodes));
  const useSeasons = $derived(seasons.length > 1);

  function select(ep: Episode) {
    selectedGuid = ep.guid;
    playKey += 1;
  }

  // Each list shows the 5 most recent; "load more" reveals the rest.
  const LIMIT = 5;
  let expanded = $state<Record<string, boolean>>({});
  const visible = (eps: Episode[], key: string) => (expanded[key] ? eps : eps.slice(0, LIMIT));

  // Shared playback state (bound out of the full AudioPlayer) so the compact
  // mobile bar controls the same audio.
  let paused = $state(true);
  let currentTime = $state(0);
  let duration = $state(0);
  let audioEl = $state<HTMLAudioElement>();
  const pct = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

  function togglePlay() {
    if (!audioEl) return;
    if (audioEl.paused) audioEl.play();
    else audioEl.pause();
  }
  function seekBar(e: Event) {
    const v = Number((e.currentTarget as HTMLInputElement).value);
    if (audioEl) audioEl.currentTime = v;
    currentTime = v;
  }
  function fmt(s: number): string {
    if (!Number.isFinite(s) || s <= 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  // Reveal the compact bar once the full panel scrolls above the nav (mobile).
  let panelEl = $state<HTMLElement>();
  let showCompact = $state(false);
  $effect(() => {
    if (!panelEl) return;
    const io = new IntersectionObserver(([entry]) => (showCompact = !entry.isIntersecting), {
      rootMargin: '-68px 0px 0px 0px'
    });
    io.observe(panelEl);
    return () => io.disconnect();
  });
</script>

<!-- Compact sticky player — mobile only, shown once the panel scrolls away. -->
<div
  class="fixed inset-x-0 top-[68px] z-40 border-b border-line bg-paper/95 backdrop-blur transition-transform duration-200 md:hidden {showCompact
    ? 'translate-y-0'
    : 'pointer-events-none -translate-y-full'}"
  aria-hidden={!showCompact}
>
  <div class="container-page flex items-center gap-3 py-2.5">
    <button
      type="button"
      onclick={togglePlay}
      aria-label={paused ? 'Play episode' : 'Pause episode'}
      class="shrink-0 text-orange-700"
    >
      {#if paused}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="0.5" /><rect x="13.5" y="5" width="3.5" height="14" rx="0.5" /></svg>
      {/if}
    </button>
    <span class="min-w-0 flex-1 truncate text-sm font-medium text-navy-900">{selected.title}</span>
  </div>
  <input
    class="compact-seek block w-full"
    type="range"
    min="0"
    max={duration || 0}
    value={currentTime}
    step="0.1"
    oninput={seekBar}
    style="--pct:{pct}%"
    aria-label="Seek through episode"
    disabled={duration === 0}
  />
</div>

<div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
  <!-- Now playing — sticky while the list scrolls (desktop). -->
  <div class="lg:sticky lg:top-24 lg:self-start">
    <article bind:this={panelEl} class="rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-7">
      <p class="t-eyebrow !text-orange-700">Now playing</p>
      <div class="mt-4 flex gap-4">
        <img
          src={selected.image}
          alt=""
          width="200"
          height="200"
          class="h-28 w-28 shrink-0 rounded-xl object-cover"
        />
        <div class="flex flex-col justify-center gap-0.5">
          {#if selected.dateLabel}<p class="text-sm font-semibold text-navy-900">{selected.dateLabel}</p>{/if}
          {#if selected.durationLabel}<p class="text-sm text-ink-soft">{selected.durationLabel}</p>{/if}
          {#if selected.season}<p class="text-sm text-ink-soft">Season {selected.season}</p>{/if}
        </div>
      </div>
      <h3 class="t-h3 mt-4 text-balance text-navy-900">{selected.title}</h3>

      {#if selected.excerpt}
        <p class="mt-3 text-[0.97rem] leading-relaxed text-ink-soft">{selected.excerpt}</p>
      {/if}

      {#if selected.audioUrl}
        <div class="mt-5">
          <AudioPlayer
            src={selected.audioUrl}
            durationLabel={selected.durationLabel}
            {playKey}
            bind:paused
            bind:currentTime
            bind:duration
            bind:audio={audioEl}
          />
        </div>
      {/if}

      <a
        class="mt-5 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
        href={selected.link}
        target="_blank"
        rel="noopener"
      >
        Show notes on Men's Therapy Hub →
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
</div>

<style>
  /* Thin seek bar for the compact mobile player. */
  .compact-seek {
    height: 3px;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    background: linear-gradient(
      to right,
      var(--color-orange-700) var(--pct, 0%),
      color-mix(in srgb, var(--color-orange-700) 22%, transparent) var(--pct, 0%)
    );
  }
  .compact-seek::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 9999px;
    background: var(--color-orange-700);
  }
  .compact-seek::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: none;
    border-radius: 9999px;
    background: var(--color-orange-700);
  }
</style>
