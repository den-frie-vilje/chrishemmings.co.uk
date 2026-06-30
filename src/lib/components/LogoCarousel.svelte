<!--
  Auto-scrolling logo marquee. Logos sit on uniform white cards (equal
  height, object-contain — so Chris's non-proportional strip scaling is
  gone) and render monochrome until hovered. Pauses on hover and via the
  bindable `paused` prop (the caller renders the keyboard-focusable
  pause/play control — WCAG 2.2.2); falls back to a static centred wrap
  when the user prefers reduced motion.
-->
<script lang="ts">
  import type { OrgLogo } from '$lib/content';

  let {
    logos,
    label = 'Organisations',
    paused = $bindable(false)
  }: { logos: OrgLogo[]; label?: string; paused?: boolean } = $props();

  // Duplicate the list so the track can loop seamlessly (translateX -50%).
  const loop = $derived([...logos, ...logos]);
</script>

{#if logos.length}
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
{/if}

<style>
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
  }
</style>
