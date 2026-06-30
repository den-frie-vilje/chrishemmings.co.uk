<!--
  Sitewide podcast player bar (SoundCloud-style). Rendered once in the site
  layout, fixed to the bottom; keeps playing as you navigate. Collapsed: a
  thin seek bar + play/pause + title + time + a chevron. Expanded (chevron):
  reveals the now-playing detail (artwork, date/duration/season, excerpt,
  show-notes link). Driven by the shared `player` store.
-->
<script lang="ts">
  import { player } from '$lib/player.svelte';
  import { splitTitle } from '$lib/podcast';

  let audio = $state<HTMLAudioElement>();
  let paused = $state(true);
  let currentTime = $state(0);
  let duration = $state(0);
  const pct = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

  // (Re)start playback whenever a new episode is selected.
  $effect(() => {
    if (player.playKey > 0 && audio) {
      currentTime = 0;
      audio.play().catch(() => {});
    }
  });

  function toggle() {
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }
  function dismiss() {
    audio?.pause();
    player.current = null;
    player.expanded = false;
  }
  function seek(e: Event) {
    const v = Number((e.currentTarget as HTMLInputElement).value);
    if (audio) audio.currentTime = v;
    currentTime = v;
  }
  function fmt(s: number): string {
    if (!Number.isFinite(s) || s <= 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  const title = $derived(player.current ? splitTitle(player.current.title) : { head: '', tail: '' });
</script>

{#if player.current}
  {@const ep = player.current}
  <section
    class="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 shadow-[0_-6px_24px_rgba(9,52,73,0.1)] backdrop-blur"
    aria-label="Podcast player"
  >
    <audio bind:this={audio} src={ep.audioUrl} preload="none" bind:paused bind:currentTime bind:duration></audio>

    <!-- Scrubber across the top edge of the bar. -->
    <input
      class="player-seek block w-full"
      type="range"
      min="0"
      max={duration || 0}
      value={currentTime}
      step="0.1"
      oninput={seek}
      style="--pct:{pct}%"
      aria-label="Seek through episode"
      disabled={duration === 0}
    />

    {#if player.expanded}
      <div class="container-page border-b border-line py-5">
        <div class="flex gap-4">
          <img
            src={ep.image}
            alt=""
            width="160"
            height="160"
            class="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
          />
          <div class="flex min-w-0 flex-col justify-center gap-0.5">
            {#if ep.dateLabel}<p class="text-sm font-semibold text-navy-900">{ep.dateLabel}</p>{/if}
            {#if ep.durationLabel}<p class="text-sm text-ink-soft">{ep.durationLabel}</p>{/if}
            {#if ep.season}<p class="text-sm text-ink-soft">Season {ep.season}</p>{/if}
          </div>
        </div>
        <h3 class="t-h3 mt-3 text-balance">
          <span class="text-navy-900">{title.head}</span><span class="text-ink-soft">{title.tail}</span>
        </h3>
        {#if ep.excerpt}
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{ep.excerpt}</p>
        {/if}
        <a
          class="mt-3 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
          href={ep.link}
          target="_blank"
          rel="noopener"
        >
          Show notes on Men's Therapy Hub →
        </a>
      </div>
    {/if}

    <!-- Collapsed control row (always visible). -->
    <div class="container-page flex items-center gap-3 py-2.5">
      <button
        type="button"
        onclick={toggle}
        aria-label={paused ? 'Play episode' : 'Pause episode'}
        class="shrink-0 text-orange-700 transition-colors hover:text-orange-600"
      >
        {#if paused}
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><rect x="7" y="5" width="3.6" height="14" rx="0.5" /><rect x="13.4" y="5" width="3.6" height="14" rx="0.5" /></svg>
        {/if}
      </button>
      <img src={ep.image} alt="" class="h-9 w-9 shrink-0 rounded object-cover" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm leading-tight">
          <span class="font-semibold text-navy-900">{title.head}</span><span class="text-ink-soft">{title.tail}</span>
        </p>
        <p class="truncate text-xs text-ink-soft">
          <span class="tabular-nums">{fmt(currentTime)} / {duration > 0 ? fmt(duration) : ep.durationLabel || '—'}</span>
          {#if ep.dateLabel}<span class="hidden sm:inline">&nbsp;·&nbsp;{ep.dateLabel}</span>{/if}
          {#if ep.season}<span class="hidden lg:inline">&nbsp;·&nbsp;Season {ep.season}</span>{/if}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onclick={() => (player.expanded = !player.expanded)}
          aria-label={player.expanded ? 'Collapse player' : 'Expand player'}
          aria-expanded={player.expanded}
          class="p-1 text-ink-soft transition-colors hover:text-navy-900"
        >
          <svg
            class="h-6 w-6 transition-transform {player.expanded ? '' : 'rotate-180'}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onclick={dismiss}
          aria-label="Close player"
          class="p-1 text-ink-soft transition-colors hover:text-navy-900"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </section>
{/if}

<style>
  .player-seek {
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
  .player-seek::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 9999px;
    background: var(--color-orange-700);
  }
  .player-seek::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border: none;
    border-radius: 9999px;
    background: var(--color-orange-700);
  }
  .player-seek:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
