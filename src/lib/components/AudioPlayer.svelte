<!--
  Minimal, monochrome-orange audio player styled to match the editorial
  "Play episode" type. Icon-only play/pause (no button background), an
  animated equaliser waveform while playing, a hairline seek bar (the same
  thickness as the lettering stems) with orange fill, and orange timecodes.
  Only one player on the page plays at a time (see $lib/audioBus).
-->
<script lang="ts">
  import { claim, release } from '$lib/audioBus';

  interface Props {
    src: string;
    /** Feed-provided duration label shown until metadata loads (e.g. "44 min"). */
    durationLabel?: string;
    /** Bump from the parent to (re)start playback on a new selection. 0
     *  (default) is passive — no autoplay on first mount. */
    playKey?: number;
  }
  let { src, durationLabel = '', playKey = 0 }: Props = $props();

  let audio = $state<HTMLAudioElement>();
  let paused = $state(true);
  let currentTime = $state(0);
  let duration = $state(0);

  // Start playing whenever the parent signals a fresh selection (playKey > 0).
  // The src has already updated by the time this runs, so play() loads + plays
  // the newly-selected episode. playKey === 0 (initial render) stays passive.
  $effect(() => {
    if (playKey > 0 && audio) {
      currentTime = 0;
      audio.play().catch(() => {});
    }
  });

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
  <audio
    bind:this={audio}
    {src}
    preload="none"
    bind:paused
    bind:currentTime
    bind:duration
    onplay={() => audio && claim(audio)}
    onpause={() => audio && release(audio)}
    onended={() => audio && release(audio)}
  ></audio>

  <button type="button" class="ctrl" onclick={toggle} aria-label={paused ? 'Play episode' : 'Pause episode'}>
    {#if paused}
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
    {:else}
      <!-- Pause bars at ~2px rendered — same thickness as the waveform lines. -->
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <rect x="8.6" y="4.5" width="2.2" height="15" />
        <rect x="13.2" y="4.5" width="2.2" height="15" />
      </svg>
    {/if}
  </button>

  <span class="eq" class:playing={!paused} aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i>
  </span>

  <span class="t">{fmt(currentTime)}</span>

  <input
    class="bar"
    type="range"
    min="0"
    max={duration || 0}
    value={currentTime}
    step="0.1"
    oninput={seek}
    style="--pct:{pct}%"
    aria-label="Seek through episode"
    aria-valuetext={`${fmt(currentTime)} of ${duration > 0 ? fmt(duration) : durationLabel || 'unknown'}`}
    disabled={duration === 0}
  />

  <span class="t">{duration > 0 ? fmt(duration) : durationLabel}</span>
</div>

<style>
  .player {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    color: var(--color-orange-700);
  }

  /* Icon-only control — no background, monochrome orange. */
  .ctrl {
    display: flex;
    flex-shrink: 0;
    color: var(--color-orange-700);
    transition: color 0.15s ease;
  }
  .ctrl:hover {
    color: var(--color-orange-600);
  }
  .ctrl svg {
    display: block;
  }

  /* Animated equaliser — "sound-like" while playing, flat when paused. */
  .eq {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 18px;
    flex-shrink: 0;
  }
  .eq i {
    /* Resting = a 2px square; grows vertically (scaleY) while playing. */
    width: 2px;
    height: 2px;
    background: var(--color-orange-700);
    transform-origin: center;
  }
  .eq.playing i {
    animation: eq 0.8s ease-in-out infinite;
  }
  /* Staggered durations/delays so the bars read as random, not in sync. */
  .eq.playing i:nth-child(1) {
    animation-duration: 0.7s;
    animation-delay: -0.2s;
  }
  .eq.playing i:nth-child(2) {
    animation-duration: 0.52s;
    animation-delay: -0.4s;
  }
  .eq.playing i:nth-child(3) {
    animation-duration: 0.9s;
    animation-delay: -0.1s;
  }
  .eq.playing i:nth-child(4) {
    animation-duration: 0.61s;
    animation-delay: -0.33s;
  }
  .eq.playing i:nth-child(5) {
    animation-duration: 0.78s;
    animation-delay: -0.15s;
  }
  @keyframes eq {
    0%,
    100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(7);
    }
  }

  /* Timecodes — heading font (Hanken Grotesk), bold for substance, with
     looser kerning than headings (which run tight). */
  .t {
    font-family: var(--font-sans);
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--color-orange-700);
    font-variant-numeric: tabular-nums;
    min-width: 3.3ch;
  }

  /* Seek bar — monochrome orange; brightens on hover like the play button. */
  .bar {
    --bar-color: var(--color-orange-700);
    flex: 1;
    height: 2px;
    border-radius: 9999px;
    appearance: none;
    -webkit-appearance: none;
    background: linear-gradient(
      to right,
      var(--bar-color) var(--pct, 0%),
      color-mix(in srgb, var(--bar-color) 22%, transparent) var(--pct, 0%)
    );
    cursor: pointer;
  }
  .bar:hover:not(:disabled) {
    --bar-color: var(--color-orange-600);
  }
  .bar:disabled {
    cursor: default;
    opacity: 0.55;
  }
  .bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 9px;
    height: 9px;
    border-radius: 9999px;
    background: var(--bar-color);
    transition: transform 0.15s ease;
  }
  .bar::-moz-range-thumb {
    width: 9px;
    height: 9px;
    border: none;
    border-radius: 9999px;
    background: var(--bar-color);
    transition: transform 0.15s ease;
  }
  .bar:hover:not(:disabled)::-webkit-slider-thumb {
    transform: scale(1.25);
  }
  .bar:hover:not(:disabled)::-moz-range-thumb {
    transform: scale(1.25);
  }
  .bar:focus-visible {
    outline: 3px solid var(--color-orange-500);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .eq.playing i {
      animation: none;
      transform: scaleY(4);
    }
  }
</style>
