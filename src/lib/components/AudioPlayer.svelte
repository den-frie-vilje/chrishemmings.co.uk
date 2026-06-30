<!--
  Minimal, page-styled audio player (no native chrome). Orange round
  play/pause button (matching the editorial accent), a seekable progress
  bar with an orange fill, and current/total timecodes. Borderless.

  `preload="none"` — the audio file isn't fetched until the listener
  hits play, so a page of 38 players costs nothing until used. Duration
  shows the feed-provided label until real metadata loads.
-->
<script lang="ts">
  interface Props {
    src: string;
    /** Feed-provided duration label shown until metadata loads (e.g. "44 min"). */
    durationLabel?: string;
  }
  let { src, durationLabel = '' }: Props = $props();

  let audio = $state<HTMLAudioElement>();
  let paused = $state(true);
  let currentTime = $state(0);
  let duration = $state(0);

  const pct = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

  function toggle() {
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
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
</script>

<div class="player">
  <audio bind:this={audio} {src} preload="none" bind:paused bind:currentTime bind:duration></audio>

  <button
    type="button"
    class="play"
    onclick={toggle}
    aria-label={paused ? 'Play episode' : 'Pause episode'}
  >
    {#if paused}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
    {:else}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
    {/if}
  </button>

  <span class="time tabular">{fmt(currentTime)}</span>

  <input
    class="bar"
    type="range"
    min="0"
    max={duration || 0}
    value={currentTime}
    step="0.1"
    oninput={seek}
    style="--pct:{pct}%"
    aria-label="Seek"
    disabled={duration === 0}
  />

  <span class="time tabular">{duration > 0 ? fmt(duration) : durationLabel}</span>
</div>

<style>
  .player {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .play {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 9999px;
    background: var(--color-orange-500);
    color: var(--color-navy-950);
    transition:
      background-color 0.18s ease,
      transform 0.12s ease;
  }
  .play:hover {
    background: var(--color-orange-600);
    color: #fff;
  }
  .play:active {
    transform: scale(0.94);
  }
  /* Nudge the play triangle to look optically centred. */
  .play svg {
    margin-left: 1px;
  }
  .time {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-ink-soft);
    min-width: 3.1ch;
  }
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  .bar {
    flex: 1;
    height: 6px;
    appearance: none;
    -webkit-appearance: none;
    border-radius: 9999px;
    background: linear-gradient(
      to right,
      var(--color-orange-500) var(--pct, 0%),
      color-mix(in srgb, var(--color-ink-soft) 28%, transparent) var(--pct, 0%)
    );
    cursor: pointer;
  }
  .bar:disabled {
    cursor: default;
    opacity: 0.6;
  }
  .bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 9999px;
    background: var(--color-orange-500);
    border: 2px solid var(--color-paper);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-ink-soft) 30%, transparent);
  }
  .bar::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-paper);
    border-radius: 9999px;
    background: var(--color-orange-500);
  }
  .bar:focus-visible {
    outline: 3px solid var(--color-orange-500);
    outline-offset: 3px;
  }
</style>
