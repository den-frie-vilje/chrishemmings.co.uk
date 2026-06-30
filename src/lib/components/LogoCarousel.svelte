<!--
  Auto-scrolling logo marquee. Logos sit on uniform white cards (equal
  height, object-contain — so Chris's non-proportional strip scaling is
  gone) and render monochrome until hovered. Pauses on hover and via a
  keyboard-focusable pause/play control (WCAG 2.2.2); falls back to a
  static centred wrap when the user prefers reduced motion.
-->
<script lang="ts">
  import type { OrgLogo } from '$lib/content';

  let { logos, label = 'Organisations' }: { logos: OrgLogo[]; label?: string } = $props();

  let paused = $state(false);

  // Duplicate the list so the track can loop seamlessly (translateX -50%).
  const loop = $derived([...logos, ...logos]);
</script>

{#if logos.length}
  <div class="wrap">
    <div class="marquee" role="group" aria-label={label}>
      <ul class="track" class:paused>
        {#each loop as org, i (org.name + '-' + i)}
          <li aria-hidden={i >= logos.length ? 'true' : undefined}>
            <span class="card">
              <img src={org.logo} alt={i < logos.length ? org.name : ''} loading="eager" />
            </span>
          </li>
        {/each}
      </ul>
    </div>

    <button
      type="button"
      class="toggle"
      aria-pressed={paused}
      aria-label={paused ? 'Play logo animation' : 'Pause logo animation'}
      onclick={() => (paused = !paused)}
    >
      {#if paused}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="0.5" /><rect x="13.5" y="5" width="3.5" height="14" rx="0.5" /></svg>
      {/if}
    </button>
  </div>
{/if}

<style>
  .wrap {
    position: relative;
  }
  .marquee {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
  }
  .track {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: max-content;
    animation: marquee 45s linear infinite;
  }
  .marquee:hover .track,
  .track.paused {
    animation-play-state: paused;
  }
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Equal-sized cards. The logo is contained within a consistent inner
       box so every card matches; per-logo width quirks are normalised by
       trimming the SVGs' own padding (e.g. Barclays). */
    height: 82px;
    width: 176px;
    padding: 16px 24px;
    background: #fff;
    border: 1px solid var(--color-line);
    border-radius: 10px;
  }
  .card img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    filter: grayscale(1);
    opacity: 0.62;
    transition:
      filter 0.2s ease,
      opacity 0.2s ease;
  }
  .card:hover img {
    filter: grayscale(0);
    opacity: 1;
  }

  /* Pause/play control — sits outside the faded mask edge so it stays
     legible; small and unobtrusive over the marquee. */
  .toggle {
    position: absolute;
    top: -2.6rem;
    right: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    border-radius: 9999px;
    background: #fff;
    border: 1px solid var(--color-line);
    color: var(--color-orange-700);
    transition:
      color 0.15s ease,
      box-shadow 0.15s ease;
  }
  .toggle:hover {
    color: var(--color-orange-600);
    box-shadow: 0 1px 6px rgb(9 52 73 / 0.12);
  }
  .toggle:focus-visible {
    outline: 3px solid var(--color-orange-500);
    outline-offset: 2px;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .track {
      animation: none;
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }
    /* No animation to control, so the toggle is meaningless — hide it. */
    .toggle {
      display: none;
    }
  }
</style>
